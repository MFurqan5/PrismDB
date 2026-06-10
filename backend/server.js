const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Database, Table, Row, Relationship, History } = require('./models');
const { runQuery } = require('./queryEngine');
const seedData = require('./seeder');

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

let isDbConnected = false;
let dbConnectionError = null;

// Connect to MongoDB if URI is provided
if (MONGODB_URI && MONGODB_URI.trim() !== '') {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      isDbConnected = true;
      dbConnectionError = null;
      console.log('Successfully connected to MongoDB Atlas.');
      await seedData();
    })
    .catch((err) => {
      isDbConnected = false;
      dbConnectionError = err.message;
      console.error('Mongoose connection error:', err.message);
      console.log('PrismDB running in sandbox mode. Set MONGODB_URI to connect Atlas.');
    });
} else {
  isDbConnected = false;
  dbConnectionError = 'MONGODB_URI not set in backend/.env';
  console.log('PrismDB running in Sandbox Fallback Mode (in-memory).');
}

// Endpoint: Database connection status
app.get('/api/status', (req, res) => {
  res.json({
    connected: isDbConnected,
    uri: MONGODB_URI ? MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 'Not Configured',
    error: dbConnectionError
  });
});

// Endpoint: Get full schema and table tree data (supporting fallback)
app.get('/api/schema', async (req, res) => {
  try {
    const result = [];
    const useInMemory = !isDbConnected;

    if (useInMemory) {
      const databasesList = global.inMemoryStore.databases;
      for (const db of databasesList) {
        const tablesList = global.inMemoryStore.tables.filter(t => t.database === db.name);
        const tablesInfo = [];

        for (const tbl of tablesList) {
          const rows = global.inMemoryStore.rows.filter(r => r.database === db.name && r.table === tbl.name);
          const rowCount = rows.length;

          const colStats = [];
          if (tbl.columns && tbl.columns.length > 0) {
            for (const colName of tbl.columns) {
              const sampleRow = rows.find(r => r.data[colName] !== undefined && r.data[colName] !== null);
              let sampleVal = sampleRow ? sampleRow.data[colName] : null;
              
              const colDef = tbl.columnDefinitions ? tbl.columnDefinitions.find(d => d.name === colName) : null;
              let valType = 'VARCHAR';

              if (colDef) {
                valType = colDef.type;
              } else if (sampleVal !== null && sampleVal !== undefined) {
                if (typeof sampleVal === 'number') valType = 'NUMBER';
                else if (typeof sampleVal === 'boolean') valType = 'BOOLEAN';
                else if (Array.isArray(sampleVal)) valType = 'ARRAY';
                else if (typeof sampleVal === 'object') valType = 'OBJECT';
              }

              const nulls = rows.filter(r => r.data[colName] === null || r.data[colName] === undefined).length;
              const uniqueVals = new Set(rows.map(r => r.data[colName]).filter(v => v !== null && v !== undefined));

              colStats.push({
                name: colName,
                type: valType,
                nullCount: nulls,
                nullPercent: rowCount > 0 ? Math.round((nulls / rowCount) * 100) : 0,
                uniqueCount: uniqueVals.size,
                sample: sampleVal,
                isPrimaryKey: colDef ? !!colDef.isPrimaryKey : (colName === 'id'),
                isNotNull: colDef ? !!colDef.isNotNull : false,
                isUnique: colDef ? !!colDef.isUnique : false
              });
            }
          }

          tablesInfo.push({
            name: tbl.name,
            rowCount,
            columns: colStats,
            indexes: tbl.indexes || []
          });
        }

        result.push({
          name: db.name,
          createdAt: db.createdAt,
          tables: tablesInfo
        });
      }
    } else {
      // MongoDB retrieval
      const databasesList = await Database.find();
      for (const db of databasesList) {
        const tablesList = await Table.find({ database: db.name });
        const tablesInfo = [];

        for (const tbl of tablesList) {
          const rowCount = await Row.countDocuments({ database: db.name, table: tbl.name });
          const sampleRow = await Row.findOne({ database: db.name, table: tbl.name });
          const colStats = [];

          if (tbl.columns && tbl.columns.length > 0) {
            for (const colName of tbl.columns) {
              let sampleVal = null;
              
              const colDef = tbl.columnDefinitions ? tbl.columnDefinitions.find(d => d.name === colName) : null;
              let valType = 'VARCHAR';

              if (sampleRow && sampleRow.data && sampleRow.data[colName] !== undefined) {
                sampleVal = sampleRow.data[colName];
                if (colDef) {
                  valType = colDef.type;
                } else {
                  if (typeof sampleVal === 'number') valType = 'NUMBER';
                  else if (typeof sampleVal === 'boolean') valType = 'BOOLEAN';
                  else if (Array.isArray(sampleVal)) valType = 'ARRAY';
                  else if (typeof sampleVal === 'object') valType = 'OBJECT';
                }
              } else if (colDef) {
                valType = colDef.type;
              }

              const allTableRows = await Row.find({ database: db.name, table: tbl.name });
              const total = allTableRows.length;
              const nulls = allTableRows.filter(r => r.data[colName] === null || r.data[colName] === undefined).length;
              const uniqueVals = new Set(allTableRows.map(r => r.data[colName]).filter(v => v !== null && v !== undefined));

              colStats.push({
                name: colName,
                type: valType,
                nullCount: nulls,
                nullPercent: total > 0 ? Math.round((nulls / total) * 100) : 0,
                uniqueCount: uniqueVals.size,
                sample: sampleVal,
                isPrimaryKey: colDef ? !!colDef.isPrimaryKey : (colName === 'id'),
                isNotNull: colDef ? !!colDef.isNotNull : false,
                isUnique: colDef ? !!colDef.isUnique : false
              });
            }
          }

          tablesInfo.push({
            name: tbl.name,
            rowCount,
            columns: colStats,
            indexes: tbl.indexes || []
          });
        }

        result.push({
          name: db.name,
          createdAt: db.createdAt,
          tables: tablesInfo
        });
      }
    }

    res.json({ databases: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Run database commands
app.post('/api/query', async (req, res) => {
  const { query, activeDb, sessionId } = req.body;
  if (!query || query.trim() === '') {
    return res.json({ success: false, error: 'Empty query statement' });
  }

  const startTime = Date.now();
  console.log(`Executing: ${query} (DB: ${activeDb || 'none'}) [Session: ${sessionId || 'default'}] [Mode: ${isDbConnected ? 'Atlas' : 'Sandbox'}]`);

  try {
    const result = await runQuery(query, activeDb, sessionId || 'default');
    
    // Log history
    if (isDbConnected) {
      await History.findOneAndUpdate(
        { query: JSON.stringify(result.ast || {}) },
        { query: query }
      );
    } else {
      const log = global.inMemoryStore.history.find(h => h.query === JSON.stringify(result.ast || {}));
      if (log) log.query = query;
    }

    res.json(result);
  } catch (error) {
    console.error('Execution Failed:', error);
    res.json({
      success: false,
      error: error.message || 'Execution error occurred'
    });
  }
});

// Endpoint: Get query history (supporting fallback)
app.get('/api/history', async (req, res) => {
  try {
    if (!isDbConnected) {
      const logs = [...global.inMemoryStore.history]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
      return res.json({ history: logs });
    }
    const logs = await History.find().sort({ timestamp: -1 }).limit(50);
    res.json({ history: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Re-seed default database
app.post('/api/seed', async (req, res) => {
  try {
    if (!isDbConnected) {
      // Clear in-memory collections and restart seeder properties
      global.inMemoryStore.databases = [{ name: 'prismdb', createdAt: new Date() }];
      global.inMemoryStore.tables = [
        {
          database: 'prismdb',
          name: 'users',
          columns: ['id', 'name', 'email', 'age', 'city', 'role', 'created_at', 'tags', 'metadata'],
          indexes: ['id', 'email']
        },
        {
          database: 'prismdb',
          name: 'threats',
          columns: ['id', 'url', 'type', 'confidence', 'status', 'detected_at'],
          indexes: ['id', 'status']
        },
        {
          database: 'prismdb',
          name: 'scans',
          columns: ['id', 'user_id', 'threat_id', 'result', 'duration_ms', 'timestamp'],
          indexes: ['id', 'user_id', 'threat_id']
        },
        {
          database: 'prismdb',
          name: 'cache_stats',
          columns: ['layer', 'hits', 'misses', 'hit_rate', 'avg_response_ms'],
          indexes: ['layer']
        }
      ];
      global.inMemoryStore.rows = [];
      global.inMemoryStore.relationships = [];
      global.inMemoryStore.history = [];

      // Re-populate mock arrays
      const m = global.inMemoryStore;
      m.rows.push(
        ...[
          { id: 1, name: 'John Doe', email: 'john@email.com', age: 25, city: 'Lahore', role: 'admin', created_at: '2026-01-10T12:00:00Z', tags: ['admin', 'security', 'it'], metadata: { city: 'Lahore', status: 'active' } },
          { id: 2, name: 'Jane Smith', email: 'jane@email.com', age: 34, city: 'Karachi', role: 'analyst', created_at: '2026-02-15T09:30:00Z', tags: ['analyst', 'security'], metadata: { city: 'Karachi', status: 'active' } },
          { id: 3, name: 'Ali Raza', email: 'ali@email.com', age: 29, city: 'Lahore', role: 'analyst', created_at: '2026-03-01T14:15:00Z', tags: ['analyst'], metadata: { city: 'Lahore', status: 'suspended' } },
          { id: 4, name: 'Sarah Connor', email: 'sarah@email.com', age: 40, city: 'Islamabad', role: 'manager', created_at: '2026-01-20T10:00:00Z', tags: ['manager', 'finance'], metadata: { city: 'Islamabad', status: 'active' } },
          { id: 5, name: 'Bruce Wayne', email: 'bruce@wayne.com', age: 35, city: 'Gotham', role: 'admin', created_at: '2026-01-01T00:00:00Z', tags: ['admin', 'vip', 'owner'], metadata: { city: 'Gotham', status: 'active' } },
          { id: 6, name: 'Clark Kent', email: 'clark@dailyplanet.com', age: 30, city: 'Metropolis', role: 'editor', created_at: '2026-02-10T08:00:00Z', tags: ['guest'], metadata: { city: 'Metropolis', status: 'active' } },
          { id: 7, name: 'Peter Parker', email: 'peter@spidey.com', age: 22, city: 'New York', role: 'guest', created_at: '2026-04-12T16:45:00Z', tags: ['guest', 'student'], metadata: { city: 'New York', status: 'active' } },
          { id: 8, name: 'Diana Prince', email: 'diana@themyscira.gov', age: 28, city: 'London', role: 'analyst', created_at: '2026-03-25T11:20:00Z', tags: ['analyst', 'government'], metadata: { city: 'London', status: 'active' } },
          { id: 9, name: 'Barry Allen', email: 'barry@centralcity.pd', age: 26, city: 'Central City', role: 'technician', created_at: '2026-05-02T13:10:00Z', tags: ['it', 'lab'], metadata: { city: 'Central City', status: 'active' } },
          { id: 10, name: 'Tony Stark', email: 'tony@stark.com', age: 45, city: 'Malibu', role: 'admin', created_at: '2026-01-15T07:00:00Z', tags: ['admin', 'vip', 'rd'], metadata: { city: 'Malibu', status: 'active' } }
        ].map(u => ({ database: 'prismdb', table: 'users', data: u }))
      );

      m.rows.push(
        ...[
          { id: 1, url: 'http://malicious-site.com/phish', type: 'Phishing', confidence: 92, status: 'active', detected_at: '2026-06-01T10:00:00Z' },
          { id: 2, url: 'http://free-crypto-giveaway.ru', type: 'Scam', confidence: 88, status: 'active', detected_at: '2026-06-02T11:30:00Z' },
          { id: 3, url: 'http://systemupdate-patch.exe.co', type: 'Malware', confidence: 99, status: 'blocked', detected_at: '2026-06-03T08:15:00Z' },
          { id: 4, url: 'http://tor-exit-node-04.onion.to', type: 'Anonymizer', confidence: 70, status: 'investigating', detected_at: '2026-06-04T14:45:00Z' },
          { id: 5, url: 'http://bad-reputation-ip.org', type: 'Botnet', confidence: 95, status: 'blocked', detected_at: '2026-06-05T09:00:00Z' },
          { id: 6, url: 'http://adware-popunder.net/script', type: 'Adware', confidence: 45, status: 'active', detected_at: '2026-06-05T12:00:00Z' },
          { id: 7, url: 'http://cryptominer-web.js', type: 'Cryptominer', confidence: 82, status: 'active', detected_at: '2026-06-06T15:10:00Z' },
          { id: 8, url: 'http://zero-day-exploit-server.su', type: 'Exploit Kit', confidence: 98, status: 'blocked', detected_at: '2026-06-07T03:25:00Z' },
          { id: 9, url: 'http://spam-advert-mailer.com', type: 'Spam', confidence: 60, status: 'active', detected_at: '2026-06-07T17:40:00Z' },
          { id: 10, url: 'http://command-and-control-server.cn', type: 'C2 Server', confidence: 100, status: 'blocked', detected_at: '2026-06-08T01:50:00Z' },
          { id: 11, url: 'http://cracked-software-keygen.net', type: 'Malware', confidence: 78, status: 'active', detected_at: '2026-06-08T11:22:00Z' },
          { id: 12, url: 'http://suspicious-dns-tracker.cc', type: 'Spyware', confidence: 68, status: 'investigating', detected_at: '2026-06-09T05:00:00Z' },
          { id: 13, url: 'http://ransomware-decrypter.top', type: 'Ransomware', confidence: 97, status: 'blocked', detected_at: '2026-06-09T19:30:00Z' },
          { id: 14, url: 'http://social-eng-portal.com/login', type: 'Phishing', confidence: 85, status: 'active', detected_at: '2026-06-10T09:12:00Z' },
          { id: 15, url: 'http://stealth-keylogger.net/dl', type: 'Malware', confidence: 91, status: 'blocked', detected_at: '2026-06-10T14:50:00Z' }
        ].map(t => ({ database: 'prismdb', table: 'threats', data: t }))
      );

      m.rows.push(
        ...[
          { id: 101, user_id: 1, threat_id: 1, result: 'flagged', duration_ms: 120, timestamp: '2026-06-01T10:05:00Z' },
          { id: 102, user_id: 2, threat_id: 1, result: 'flagged', duration_ms: 145, timestamp: '2026-06-01T10:12:00Z' },
          { id: 103, user_id: 3, threat_id: 2, result: 'flagged', duration_ms: 98, timestamp: '2026-06-02T11:45:00Z' },
          { id: 104, user_id: 1, threat_id: 3, result: 'blocked', duration_ms: 250, timestamp: '2026-06-03T08:16:00Z' },
          { id: 105, user_id: 4, threat_id: 3, result: 'blocked', duration_ms: 220, timestamp: '2026-06-03T08:20:00Z' },
          { id: 106, user_id: 5, threat_id: 5, result: 'blocked', duration_ms: 310, timestamp: '2026-06-05T09:02:00Z' },
          { id: 107, user_id: 6, threat_id: 4, result: 'clean', duration_ms: 85, timestamp: '2026-06-04T15:00:00Z' },
          { id: 108, user_id: 7, threat_id: 6, result: 'flagged', duration_ms: 110, timestamp: '2026-06-05T12:05:00Z' },
          { id: 109, user_id: 8, threat_id: 7, result: 'flagged', duration_ms: 175, timestamp: '2026-06-06T15:15:00Z' },
          { id: 110, user_id: 9, threat_id: 8, result: 'blocked', duration_ms: 405, timestamp: '2026-06-07T03:27:00Z' },
          { id: 111, user_id: 10, threat_id: 10, result: 'blocked', duration_ms: 490, timestamp: '2026-06-08T01:52:00Z' },
          { id: 112, user_id: 2, threat_id: 11, result: 'flagged', duration_ms: 130, timestamp: '2026-06-08T11:30:00Z' },
          { id: 113, user_id: 3, threat_id: 12, result: 'clean', duration_ms: 102, timestamp: '2026-06-09T05:10:00Z' },
          { id: 114, user_id: 5, threat_id: 13, result: 'blocked', duration_ms: 380, timestamp: '2026-06-09T19:35:00Z' },
          { id: 115, user_id: 1, threat_id: 14, result: 'flagged', duration_ms: 115, timestamp: '2026-06-10T09:15:00Z' },
          { id: 116, user_id: 4, threat_id: 14, result: 'flagged', duration_ms: 125, timestamp: '2026-06-10T09:22:00Z' },
          { id: 117, user_id: 7, threat_id: 15, result: 'blocked', duration_ms: 270, timestamp: '2026-06-10T14:52:00Z' },
          { id: 118, user_id: 8, threat_id: 15, result: 'blocked', duration_ms: 295, timestamp: '2026-06-10T14:55:00Z' },
          { id: 119, user_id: 2, threat_id: 3, result: 'blocked', duration_ms: 210, timestamp: '2026-06-03T08:45:00Z' },
          { id: 120, user_id: 10, threat_id: 5, result: 'blocked', duration_ms: 320, timestamp: '2026-06-05T09:18:00Z' }
        ].map(s => ({ database: 'prismdb', table: 'scans', data: s }))
      );

      m.rows.push(
        ...[
          { layer: 'L1 Fast Cache', hits: 254820, misses: 12450, hit_rate: 95.3, avg_response_ms: 0.12 },
          { layer: 'L2 Shared Cache', hits: 89450, misses: 32410, hit_rate: 73.4, avg_response_ms: 1.45 },
          { layer: 'Edge CDN Content Cache', hits: 1450200, misses: 45200, hit_rate: 96.9, avg_response_ms: 12.8 },
          { layer: 'Internal SSD Cache', hits: 54100, misses: 1290, hit_rate: 97.6, avg_response_ms: 2.1 }
        ].map(c => ({ database: 'prismdb', table: 'cache_stats', data: c }))
      );

      m.relationships.push(
        ...[
          { database: 'prismdb', fromTable: 'users', fromId: 1, toTable: 'scans', toId: 101, type: 'triggered' },
          { database: 'prismdb', fromTable: 'users', fromId: 1, toTable: 'scans', toId: 104, type: 'triggered' },
          { database: 'prismdb', fromTable: 'scans', fromId: 101, toTable: 'threats', toId: 1, type: 'matched_ioc' },
          { database: 'prismdb', fromTable: 'scans', fromId: 104, toTable: 'threats', toId: 3, type: 'matched_ioc' },
          { database: 'prismdb', fromTable: 'users', fromId: 2, toTable: 'scans', toId: 102, type: 'triggered' },
          { database: 'prismdb', fromTable: 'scans', fromId: 102, toTable: 'threats', toId: 1, type: 'matched_ioc' }
        ]
      );

      return res.json({ success: true, message: 'In-memory sandbox re-seeded successfully' });
    }

    // MongoDB flush & reseed
    console.log('Flushing collections for prismdb...');
    await Database.deleteOne({ name: 'prismdb' });
    await Table.deleteMany({ database: 'prismdb' });
    await Row.deleteMany({ database: 'prismdb' });
    await Relationship.deleteMany({ database: 'prismdb' });
    
    await seedData();
    res.json({ success: true, message: 'Database prismdb re-seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`PrismDB backend running on port ${PORT}`);
});
