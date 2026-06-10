// =========================================================================
// MongoDB Atlas / mongosh Initialization & Seeding Script for SentinelDB
// =========================================================================
// Run this script in your MongoDB Shell (mongosh) or paste it in the 
// MongoDB Compass console to pre-create and populate the collections.
//
// Usage in mongosh:
//   mongosh "mongodb+srv://your-atlas-uri" init_atlas_schema.js
// =========================================================================

// Switch to database context (SentinelDB default database collections)
db = db.getSiblingDB('sentineldb');

// Clear existing tables to ensure clean initialization
db.databases.drop();
db.tables.drop();
db.rows.drop();
db.relationships.drop();
db.histories.drop();

print('Creating metadata schemas...');

// 1. Create Database entry
db.databases.insertOne({
  name: 'sentineldb',
  createdAt: new Date()
});

// 2. Create Table entries
db.tables.insertMany([
  {
    database: 'sentineldb',
    name: 'users',
    columns: ['id', 'name', 'email', 'age', 'city', 'role', 'created_at', 'tags', 'metadata'],
    indexes: ['id', 'email']
  },
  {
    database: 'sentineldb',
    name: 'threats',
    columns: ['id', 'url', 'type', 'confidence', 'status', 'detected_at'],
    indexes: ['id', 'status']
  },
  {
    database: 'sentineldb',
    name: 'scans',
    columns: ['id', 'user_id', 'threat_id', 'result', 'duration_ms', 'timestamp'],
    indexes: ['id', 'user_id', 'threat_id']
  },
  {
    database: 'sentineldb',
    name: 'cache_stats',
    columns: ['layer', 'hits', 'misses', 'hit_rate', 'avg_response_ms'],
    indexes: ['layer']
  }
]);

// 3. Create unique compound index on tables
db.tables.createIndex({ database: 1, name: 1 }, { unique: true });

print('Seeding document records (rows)...');

// 3. Seed 'users' rows
db.rows.insertMany([
  { database: 'sentineldb', table: 'users', data: { id: 1, name: 'John Doe', email: 'john@email.com', age: 25, city: 'Lahore', role: 'admin', created_at: '2026-01-10T12:00:00Z', tags: ['admin', 'security', 'it'], metadata: { city: 'Lahore', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 2, name: 'Jane Smith', email: 'jane@email.com', age: 34, city: 'Karachi', role: 'analyst', created_at: '2026-02-15T09:30:00Z', tags: ['analyst', 'security'], metadata: { city: 'Karachi', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 3, name: 'Ali Raza', email: 'ali@email.com', age: 29, city: 'Lahore', role: 'analyst', created_at: '2026-03-01T14:15:00Z', tags: ['analyst'], metadata: { city: 'Lahore', status: 'suspended' } } },
  { database: 'sentineldb', table: 'users', data: { id: 4, name: 'Sarah Connor', email: 'sarah@email.com', age: 40, city: 'Islamabad', role: 'manager', created_at: '2026-01-20T10:00:00Z', tags: ['manager', 'finance'], metadata: { city: 'Islamabad', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 5, name: 'Bruce Wayne', email: 'bruce@wayne.com', age: 35, city: 'Gotham', role: 'admin', created_at: '2026-01-01T00:00:00Z', tags: ['admin', 'vip', 'owner'], metadata: { city: 'Gotham', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 6, name: 'Clark Kent', email: 'clark@dailyplanet.com', age: 30, city: 'Metropolis', role: 'editor', created_at: '2026-02-10T08:00:00Z', tags: ['guest'], metadata: { city: 'Metropolis', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 7, name: 'Peter Parker', email: 'peter@spidey.com', age: 22, city: 'New York', role: 'guest', created_at: '2026-04-12T16:45:00Z', tags: ['guest', 'student'], metadata: { city: 'New York', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 8, name: 'Diana Prince', email: 'diana@themyscira.gov', age: 28, city: 'London', role: 'analyst', created_at: '2026-03-25T11:20:00Z', tags: ['analyst', 'government'], metadata: { city: 'London', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 9, name: 'Barry Allen', email: 'barry@centralcity.pd', age: 26, city: 'Central City', role: 'technician', created_at: '2026-05-02T13:10:00Z', tags: ['it', 'lab'], metadata: { city: 'Central City', status: 'active' } } },
  { database: 'sentineldb', table: 'users', data: { id: 10, name: 'Tony Stark', email: 'tony@stark.com', age: 45, city: 'Malibu', role: 'admin', created_at: '2026-01-15T07:00:00Z', tags: ['admin', 'vip', 'rd'], metadata: { city: 'Malibu', status: 'active' } } }
]);

// Seed 'threats' rows
db.rows.insertMany([
  { database: 'sentineldb', table: 'threats', data: { id: 1, url: 'http://malicious-site.com/phish', type: 'Phishing', confidence: 92, status: 'active', detected_at: '2026-06-01T10:00:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 2, url: 'http://free-crypto-giveaway.ru', type: 'Scam', confidence: 88, status: 'active', detected_at: '2026-06-02T11:30:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 3, url: 'http://systemupdate-patch.exe.co', type: 'Malware', confidence: 99, status: 'blocked', detected_at: '2026-06-03T08:15:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 4, url: 'http://tor-exit-node-04.onion.to', type: 'Anonymizer', confidence: 70, status: 'investigating', detected_at: '2026-06-04T14:45:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 5, url: 'http://bad-reputation-ip.org', type: 'Botnet', confidence: 95, status: 'blocked', detected_at: '2026-06-05T09:00:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 6, url: 'http://adware-popunder.net/script', type: 'Adware', confidence: 45, status: 'active', detected_at: '2026-06-05T12:00:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 7, url: 'http://cryptominer-web.js', type: 'Cryptominer', confidence: 82, status: 'active', detected_at: '2026-06-06T15:10:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 8, url: 'http://zero-day-exploit-server.su', type: 'Exploit Kit', confidence: 98, status: 'blocked', detected_at: '2026-06-07T03:25:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 9, url: 'http://spam-advert-mailer.com', type: 'Spam', confidence: 60, status: 'active', detected_at: '2026-06-07T17:40:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 10, url: 'http://command-and-control-server.cn', type: 'C2 Server', confidence: 100, status: 'blocked', detected_at: '2026-06-08T01:50:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 11, url: 'http://cracked-software-keygen.net', type: 'Malware', confidence: 78, status: 'active', detected_at: '2026-06-08T11:22:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 12, url: 'http://suspicious-dns-tracker.cc', type: 'Spyware', confidence: 68, status: 'investigating', detected_at: '2026-06-09T05:00:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 13, url: 'http://ransomware-decrypter.top', type: 'Ransomware', confidence: 97, status: 'blocked', detected_at: '2026-06-09T19:30:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 14, url: 'http://social-eng-portal.com/login', type: 'Phishing', confidence: 85, status: 'active', detected_at: '2026-06-10T09:12:00Z' } },
  { database: 'sentineldb', table: 'threats', data: { id: 15, url: 'http://stealth-keylogger.net/dl', type: 'Malware', confidence: 91, status: 'blocked', detected_at: '2026-06-10T14:50:00Z' } }
]);

// Seed 'scans' rows
db.rows.insertMany([
  { database: 'sentineldb', table: 'scans', data: { id: 101, user_id: 1, threat_id: 1, result: 'flagged', duration_ms: 120, timestamp: '2026-06-01T10:05:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 102, user_id: 2, threat_id: 1, result: 'flagged', duration_ms: 145, timestamp: '2026-06-01T10:12:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 103, user_id: 3, threat_id: 2, result: 'flagged', duration_ms: 98, timestamp: '2026-06-02T11:45:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 104, user_id: 1, threat_id: 3, result: 'blocked', duration_ms: 250, timestamp: '2026-06-03T08:16:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 105, user_id: 4, threat_id: 3, result: 'blocked', duration_ms: 220, timestamp: '2026-06-03T08:20:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 106, user_id: 5, threat_id: 5, result: 'blocked', duration_ms: 310, timestamp: '2026-06-05T09:02:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 107, user_id: 6, threat_id: 4, result: 'clean', duration_ms: 85, timestamp: '2026-06-04T15:00:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 108, user_id: 7, threat_id: 6, result: 'flagged', duration_ms: 110, timestamp: '2026-06-05T12:05:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 109, user_id: 8, threat_id: 7, result: 'flagged', duration_ms: 175, timestamp: '2026-06-06T15:15:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 110, user_id: 9, threat_id: 8, result: 'blocked', duration_ms: 405, timestamp: '2026-06-07T03:27:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 111, user_id: 10, threat_id: 10, result: 'blocked', duration_ms: 490, timestamp: '2026-06-08T01:52:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 112, user_id: 2, threat_id: 11, result: 'flagged', duration_ms: 130, timestamp: '2026-06-08T11:30:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 113, user_id: 3, threat_id: 12, result: 'clean', duration_ms: 102, timestamp: '2026-06-09T05:10:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 114, user_id: 5, threat_id: 13, result: 'blocked', duration_ms: 380, timestamp: '2026-06-09T19:35:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 115, user_id: 1, threat_id: 14, result: 'flagged', duration_ms: 115, timestamp: '2026-06-10T09:15:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 116, user_id: 4, threat_id: 14, result: 'flagged', duration_ms: 125, timestamp: '2026-06-10T09:22:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 117, user_id: 7, threat_id: 15, result: 'blocked', duration_ms: 270, timestamp: '2026-06-10T14:52:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 118, user_id: 8, threat_id: 15, result: 'blocked', duration_ms: 295, timestamp: '2026-06-10T14:55:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 119, user_id: 2, threat_id: 3, result: 'blocked', duration_ms: 210, timestamp: '2026-06-03T08:45:00Z' } },
  { database: 'sentineldb', table: 'scans', data: { id: 120, user_id: 10, threat_id: 5, result: 'blocked', duration_ms: 320, timestamp: '2026-06-05T09:18:00Z' } }
]);

// Seed 'cache_stats' rows
db.rows.insertMany([
  { database: 'sentineldb', table: 'cache_stats', data: { layer: 'L1 Fast Cache', hits: 254820, misses: 12450, hit_rate: 95.3, avg_response_ms: 0.12 } },
  { database: 'sentineldb', table: 'cache_stats', data: { layer: 'L2 Shared Cache', hits: 89450, misses: 32410, hit_rate: 73.4, avg_response_ms: 1.45 } },
  { database: 'sentineldb', table: 'cache_stats', data: { layer: 'Edge CDN Content Cache', hits: 1450200, misses: 45200, hit_rate: 96.9, avg_response_ms: 12.8 } },
  { database: 'sentineldb', table: 'cache_stats', data: { layer: 'Internal SSD Cache', hits: 54100, misses: 1290, hit_rate: 97.6, avg_response_ms: 2.1 } }
]);

// 4. Seed Graph Relationships
db.relationships.insertMany([
  { database: 'sentineldb', fromTable: 'users', fromId: 1, toTable: 'scans', toId: 101, type: 'triggered' },
  { database: 'sentineldb', fromTable: 'users', fromId: 1, toTable: 'scans', toId: 104, type: 'triggered' },
  { database: 'sentineldb', fromTable: 'scans', fromId: 101, toTable: 'threats', toId: 1, type: 'matched_ioc' },
  { database: 'sentineldb', fromTable: 'scans', fromId: 104, toTable: 'threats', toId: 3, type: 'matched_ioc' },
  { database: 'sentineldb', fromTable: 'users', fromId: 2, toTable: 'scans', toId: 102, type: 'triggered' },
  { database: 'sentineldb', fromTable: 'scans', fromId: 102, toTable: 'threats', toId: 1, type: 'matched_ioc' }
]);

// 5. Create search indexing keys
db.rows.createIndex({ database: 1, table: 1 });
db.relationships.createIndex({ database: 1, fromTable: 1, fromId: 1 });

print('Atlas database seeding completed successfully!');
