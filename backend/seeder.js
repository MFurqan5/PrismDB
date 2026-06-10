const { Database, Table, Row, Relationship } = require('./models');

async function seedData() {
  try {
    // 1. Create or verify prismdb
    let db = await Database.findOne({ name: 'prismdb' });
    if (!db) {
      db = new Database({ name: 'prismdb' });
      await db.save();
    }

    // 2. Setup Tables schema definitions
    const tableSpecs = [
      {
        name: 'users',
        columns: ['id', 'name', 'email', 'age', 'city', 'role', 'created_at', 'tags', 'metadata'],
        indexes: ['id', 'email']
      },
      {
        name: 'threats',
        columns: ['id', 'url', 'type', 'confidence', 'status', 'detected_at'],
        indexes: ['id', 'status']
      },
      {
        name: 'scans',
        columns: ['id', 'user_id', 'threat_id', 'result', 'duration_ms', 'timestamp'],
        indexes: ['id', 'user_id', 'threat_id']
      },
      {
        name: 'cache_stats',
        columns: ['layer', 'hits', 'misses', 'hit_rate', 'avg_response_ms'],
        indexes: ['layer']
      }
    ];

    for (const spec of tableSpecs) {
      await Table.findOneAndUpdate(
        { database: 'prismdb', name: spec.name },
        {
          database: 'prismdb',
          name: spec.name,
          columns: spec.columns,
          indexes: spec.indexes
        },
        { upsert: true, new: true }
      );
    }

    // 3. Seed Users (10 rows)
    const userCount = await Row.countDocuments({ database: 'prismdb', table: 'users' });
    if (userCount === 0) {
      const usersData = [
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
      ];

      await Row.insertMany(usersData.map(u => ({
        database: 'prismdb',
        table: 'users',
        data: u
      })));
      console.log('Seeded users table.');
    }

    // 4. Seed Threats (15 rows)
    const threatCount = await Row.countDocuments({ database: 'prismdb', table: 'threats' });
    if (threatCount === 0) {
      const threatsData = [
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
      ];

      await Row.insertMany(threatsData.map(t => ({
        database: 'prismdb',
        table: 'threats',
        data: t
      })));
      console.log('Seeded threats table.');
    }

    // 5. Seed Scans (20 rows)
    const scanCount = await Row.countDocuments({ database: 'prismdb', table: 'scans' });
    if (scanCount === 0) {
      const scansData = [
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
      ];

      await Row.insertMany(scansData.map(s => ({
        database: 'prismdb',
        table: 'scans',
        data: s
      })));
      console.log('Seeded scans table.');
    }

    // 6. Seed Cache Stats (4 rows)
    const cacheCount = await Row.countDocuments({ database: 'prismdb', table: 'cache_stats' });
    if (cacheCount === 0) {
      const cacheData = [
        { layer: 'L1 Fast Cache', hits: 254820, misses: 12450, hit_rate: 95.3, avg_response_ms: 0.12 },
        { layer: 'L2 Shared Cache', hits: 89450, misses: 32410, hit_rate: 73.4, avg_response_ms: 1.45 },
        { layer: 'Edge CDN Content Cache', hits: 1450200, misses: 45200, hit_rate: 96.9, avg_response_ms: 12.8 },
        { layer: 'Internal SSD Cache', hits: 54100, misses: 1290, hit_rate: 97.6, avg_response_ms: 2.1 }
      ];

      await Row.insertMany(cacheData.map(c => ({
        database: 'prismdb',
        table: 'cache_stats',
        data: c
      })));
      console.log('Seeded cache_stats table.');
    }

    // 7. Seed Graph relationships (5 edges linking users and threats)
    const edgeCount = await Relationship.countDocuments({ database: 'prismdb' });
    if (edgeCount === 0) {
      const edges = [
        { database: 'prismdb', fromTable: 'users', fromId: 1, toTable: 'scans', toId: 101, type: 'triggered' },
        { database: 'prismdb', fromTable: 'users', fromId: 1, toTable: 'scans', toId: 104, type: 'triggered' },
        { database: 'prismdb', fromTable: 'scans', fromId: 101, toTable: 'threats', toId: 1, type: 'matched_ioc' },
        { database: 'prismdb', fromTable: 'scans', fromId: 104, toTable: 'threats', toId: 3, type: 'matched_ioc' },
        { database: 'prismdb', fromTable: 'users', fromId: 2, toTable: 'scans', toId: 102, type: 'triggered' },
        { database: 'prismdb', fromTable: 'scans', fromId: 102, toTable: 'threats', toId: 1, type: 'matched_ioc' }
      ];

      await Relationship.insertMany(edges);
      console.log('Seeded graph relationships.');
    }

    console.log('production-grade multi-model document-graph demo data seeded successfully!');
  } catch (error) {
    console.error('Seeder execution failed:', error);
  }
}

module.exports = seedData;
