const mongoose = require('mongoose');
const { Database, Table, Row, Relationship, History } = require('./models');

// =========================================================================
// IN-MEMORY STORAGE FALLBACK DEFINITIONS (For sandbox mode)
// =========================================================================
if (!global.inMemoryStore) {
  global.inMemoryStore = {
    databases: [{ name: 'prismdb', createdAt: new Date() }],
    tables: [
      {
        database: 'prismdb',
        name: 'users',
        columns: ['id', 'name', 'email', 'age', 'city', 'role', 'created_at', 'tags', 'metadata'],
        columnDefinitions: [
          { name: 'id', type: 'INT', isPrimaryKey: true, isNotNull: true, isUnique: true },
          { name: 'name', type: 'VARCHAR', isPrimaryKey: false, isNotNull: true, isUnique: false },
          { name: 'email', type: 'VARCHAR', isPrimaryKey: false, isNotNull: true, isUnique: true },
          { name: 'age', type: 'INT', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'city', type: 'VARCHAR', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'role', type: 'VARCHAR', isPrimaryKey: false, isNotNull: false, isUnique: false }
        ],
        indexes: ['id', 'email']
      },
      {
        database: 'prismdb',
        name: 'threats',
        columns: ['id', 'url', 'type', 'confidence', 'status', 'detected_at'],
        columnDefinitions: [
          { name: 'id', type: 'INT', isPrimaryKey: true, isNotNull: true, isUnique: true },
          { name: 'url', type: 'VARCHAR', isPrimaryKey: false, isNotNull: true, isUnique: false },
          { name: 'type', type: 'VARCHAR', isPrimaryKey: false, isNotNull: true, isUnique: false },
          { name: 'confidence', type: 'INT', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'status', type: 'VARCHAR', isPrimaryKey: false, isNotNull: false, isUnique: false }
        ],
        indexes: ['id', 'status']
      },
      {
        database: 'prismdb',
        name: 'scans',
        columns: ['id', 'user_id', 'threat_id', 'result', 'duration_ms', 'timestamp'],
        columnDefinitions: [
          { name: 'id', type: 'INT', isPrimaryKey: true, isNotNull: true, isUnique: true },
          { name: 'user_id', type: 'INT', isPrimaryKey: false, isNotNull: true, isUnique: false },
          { name: 'threat_id', type: 'INT', isPrimaryKey: false, isNotNull: true, isUnique: false },
          { name: 'result', type: 'VARCHAR', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'duration_ms', type: 'INT', isPrimaryKey: false, isNotNull: false, isUnique: false }
        ],
        indexes: ['id', 'user_id', 'threat_id']
      },
      {
        database: 'prismdb',
        name: 'cache_stats',
        columns: ['layer', 'hits', 'misses', 'hit_rate', 'avg_response_ms'],
        columnDefinitions: [
          { name: 'layer', type: 'VARCHAR', isPrimaryKey: true, isNotNull: true, isUnique: true },
          { name: 'hits', type: 'INT', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'misses', type: 'INT', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'hit_rate', type: 'DECIMAL', isPrimaryKey: false, isNotNull: false, isUnique: false },
          { name: 'avg_response_ms', type: 'DECIMAL', isPrimaryKey: false, isNotNull: false, isUnique: false }
        ],
        indexes: ['layer']
      }
    ],
    rows: [],
    relationships: [],
    history: []
  };

  // Seed In-Memory Rows (Default cybersecurity dataset)
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
}

// Initialise Connection Sessions Object for ACID isolation
if (!global.dbSessions) {
  global.dbSessions = {};
}

// =========================================================================
// 1. TOKENIZER (LEXER)
// =========================================================================
class Tokenizer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  error(msg) {
    throw {
      message: msg,
      position: this.pos,
      line: this.line,
      column: this.col
    };
  }

  tokenize() {
    const tokens = [];
    const keywords = new Set([
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'SHOW', 'USE', 'DESCRIBE',
      'RENAME', 'TO', 'FROM', 'WHERE', 'JOIN', 'ON', 'INNER', 'LEFT', 'RIGHT', 'ORDER',
      'BY', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'FIND', 'IN', 'CONTAINS', 'INDEX',
      'GRAPH', 'LINK', 'AS', 'TRAVERSE', 'DEPTH', 'AND', 'OR', 'LIKE', 'SET', 'INTO', 'VALUES',
      'DATABASE', 'DATABASES', 'TABLE', 'TABLES', 'BEGIN', 'TRANSACTION', 'COMMIT', 'ROLLBACK',
      'PRIMARY', 'KEY', 'NOT', 'NULL', 'UNIQUE', 'DEFAULT', 'ASC', 'DESC', 'TRUE', 'FALSE',
      'COUNT', 'AVG', 'MIN', 'MAX', 'SUM', 'GROUP'
    ]);

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      // Skip whitespace
      if (/\s/.test(char)) {
        if (char === '\n') {
          this.line++;
          this.col = 1;
        } else {
          this.col++;
        }
        this.pos++;
        continue;
      }

      // Skip comments
      if (char === '-' && this.input[this.pos + 1] === '-') {
        while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
          this.pos++;
        }
        continue;
      }

      // Check for Graph Link operator "->"
      if (char === '-' && this.input[this.pos + 1] === '>') {
        tokens.push({
          type: 'OPERATOR',
          value: '->',
          start: this.pos,
          end: this.pos + 2,
          line: this.line,
          col: this.col
        });
        this.pos += 2;
        this.col += 2;
        continue;
      }

      // Punctuation
      if (/[(),.*;]/.test(char)) {
        tokens.push({
          type: 'PUNCTUATION',
          value: char,
          start: this.pos,
          end: this.pos + 1,
          line: this.line,
          col: this.col
        });
        this.pos++;
        this.col++;
        continue;
      }

      // Operators
      const twoCharOp = this.input.substring(this.pos, this.pos + 2);
      if (['!=', '>=', '<=', '<>'].includes(twoCharOp)) {
        tokens.push({
          type: 'OPERATOR',
          value: twoCharOp,
          start: this.pos,
          end: this.pos + 2,
          line: this.line,
          col: this.col
        });
        this.pos += 2;
        this.col += 2;
        continue;
      }
      if (/[=><]/.test(char)) {
        tokens.push({
          type: 'OPERATOR',
          value: char,
          start: this.pos,
          end: this.pos + 1,
          line: this.line,
          col: this.col
        });
        this.pos++;
        this.col++;
        continue;
      }

      // String literals (single or double quotes)
      if (char === "'" || char === '"') {
        const quote = char;
        let str = '';
        const start = this.pos;
        this.pos++; // skip opening quote
        this.col++;

        while (this.pos < this.input.length && this.input[this.pos] !== quote) {
          if (this.input[this.pos] === '\n') {
            this.line++;
            this.col = 1;
          } else {
            this.col++;
          }
          str += this.input[this.pos];
          this.pos++;
        }

        if (this.pos >= this.input.length) {
          this.error('Unterminated string literal');
        }

        this.pos++; // skip closing quote
        this.col++;
        tokens.push({
          type: 'STRING',
          value: str,
          start,
          end: this.pos,
          line: this.line,
          col: this.col - (this.pos - start)
        });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let numStr = '';
        const start = this.pos;
        while (this.pos < this.input.length && /[0-9.]/.test(this.input[this.pos])) {
          numStr += this.input[this.pos];
          this.pos++;
          this.col++;
        }
        const val = numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr, 10);
        tokens.push({
          type: 'NUMBER',
          value: val,
          start,
          end: this.pos,
          line: this.line,
          col: this.col - (this.pos - start)
        });
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let identStr = '';
        const start = this.pos;
        while (
          this.pos < this.input.length &&
          /[a-zA-Z0-9_.*]/.test(this.input[this.pos])
        ) {
          identStr += this.input[this.pos];
          this.pos++;
          this.col++;
        }

        const upper = identStr.toUpperCase();
        if (keywords.has(upper)) {
          tokens.push({
            type: 'KEYWORD',
            value: upper,
            start,
            end: this.pos,
            line: this.line,
            col: this.col - (this.pos - start)
          });
        } else {
          tokens.push({
            type: 'IDENTIFIER',
            value: identStr,
            start,
            end: this.pos,
            line: this.line,
            col: this.col - (this.pos - start)
          });
        }
        continue;
      }

      this.error(`Unexpected character: '${char}'`);
    }

    return tokens;
  }
}

// =========================================================================
// 2. PARSER
// =========================================================================
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || null;
  }

  next() {
    return this.tokens[this.pos++] || null;
  }

  matchKeyword(val) {
    const t = this.peek();
    return t && t.type === 'KEYWORD' && t.value === val;
  }

  matchOperator(val) {
    const t = this.peek();
    return t && t.type === 'OPERATOR' && t.value === val;
  }

  consumeKeyword(val) {
    const t = this.peek();
    if (!t || t.type !== 'KEYWORD' || t.value !== val) {
      this.error(`Expected keyword '${val}'`);
    }
    return this.next();
  }

  consumePunctuation(val) {
    const t = this.peek();
    if (!t || t.type !== 'PUNCTUATION' || t.value !== val) {
      this.error(`Expected punctuation '${val}'`);
    }
    return this.next();
  }

  error(msg, token = null) {
    const t = token || this.peek() || (this.tokens.length > 0 ? this.tokens[this.tokens.length - 1] : null);
    throw {
      message: msg,
      position: t ? t.start : 0,
      line: t ? t.line : 1,
      column: t ? t.col : 1
    };
  }

  parse() {
    if (this.tokens.length === 0) {
      this.error('Empty query');
    }

    const first = this.peek();
    if (!first || first.type !== 'KEYWORD') {
      this.error(`Invalid syntax: Query must start with a keyword (e.g. SELECT, INSERT, CREATE)`);
    }

    let statement = null;
    switch (first.value) {
      case 'CREATE':
        statement = this.parseCreate();
        break;
      case 'SHOW':
        statement = this.parseShow();
        break;
      case 'USE':
        statement = this.parseUse();
        break;
      case 'DROP':
        statement = this.parseDrop();
        break;
      case 'DESCRIBE':
        statement = this.parseDescribe();
        break;
      case 'RENAME':
        statement = this.parseRename();
        break;
      case 'INSERT':
        statement = this.parseInsert();
        break;
      case 'SELECT':
        statement = this.parseSelectWithSetOperations();
        break;
      case 'UPDATE':
        statement = this.parseUpdate();
        break;
      case 'DELETE':
        statement = this.parseDelete();
        break;
      case 'FIND':
        statement = this.parseFind();
        break;
      case 'INDEX':
        statement = this.parseIndex();
        break;
      case 'GRAPH':
        statement = this.parseGraph();
        break;
      case 'BEGIN':
        this.next(); // consume BEGIN
        this.consumeKeyword('TRANSACTION');
        statement = { type: 'BEGIN_TRANSACTION' };
        break;
      case 'COMMIT':
        this.next(); // consume COMMIT
        statement = { type: 'COMMIT' };
        break;
      case 'ROLLBACK':
        this.next(); // consume ROLLBACK
        statement = { type: 'ROLLBACK' };
        break;
      default:
        this.error(`Unsupported database command: '${first.value}'`);
    }

    const trailing = this.peek();
    if (trailing && trailing.type === 'PUNCTUATION' && trailing.value === ';') {
      this.next();
    }

    if (this.pos < this.tokens.length) {
      this.error(`Unexpected token '${this.peek().value}' after statement completion`);
    }

    return statement;
  }

  parseCreate() {
    this.next(); // consume CREATE
    const target = this.next();
    if (!target || target.type !== 'KEYWORD') {
      this.error("Expected 'DATABASE' or 'TABLE' after 'CREATE'");
    }

    if (target.value === 'DATABASE') {
      const nameToken = this.next();
      if (!nameToken || nameToken.type !== 'IDENTIFIER') {
        this.error('Expected database name');
      }
      return { type: 'CREATE_DATABASE', name: nameToken.value };
    }

    if (target.value === 'TABLE') {
      const nameToken = this.next();
      if (!nameToken || nameToken.type !== 'IDENTIFIER') {
        this.error('Expected table name');
      }

      this.consumePunctuation('(');
      const columnDefinitions = [];
      const columnsList = [];

      while (true) {
        const colNameTok = this.next();
        if (!colNameTok || colNameTok.type !== 'IDENTIFIER') {
          this.error('Expected column name');
        }
        
        const colName = colNameTok.value;
        let dataType = 'VARCHAR';
        let isPrimaryKey = false;
        let isNotNull = false;
        let isUnique = false;

        // Parse optional datatype
        const typeTok = this.peek();
        const supportedTypes = ['INT', 'INTEGER', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DECIMAL', 'DOUBLE', 'FLOAT'];
        
        if (
          typeTok && 
          typeTok.type === 'IDENTIFIER' && 
          supportedTypes.includes(typeTok.value.toUpperCase())
        ) {
          dataType = this.next().value.toUpperCase();
          
          // Parse dimension brackets e.g. VARCHAR(255)
          const dimTok = this.peek();
          if (dimTok && dimTok.type === 'PUNCTUATION' && dimTok.value === '(') {
            this.next(); // '('
            const size = this.next(); // value
            if (!size || size.type !== 'NUMBER') this.error('Expected integer dimension size');
            this.consumePunctuation(')');
          }
        }

        // Parse optional constraints (PRIMARY KEY, NOT NULL, UNIQUE)
        while (true) {
          const constr = this.peek();
          if (!constr) break;
          if (constr.type === 'KEYWORD') {
            if (constr.value === 'PRIMARY') {
              this.next(); // PRIMARY
              this.consumeKeyword('KEY');
              isPrimaryKey = true;
              isNotNull = true; // PK is inherently NOT NULL
            } else if (constr.value === 'NOT') {
              this.next(); // NOT
              this.consumeKeyword('NULL');
              isNotNull = true;
            } else if (constr.value === 'UNIQUE') {
              this.next(); // UNIQUE
              isUnique = true;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        columnDefinitions.push({
          name: colName,
          type: dataType,
          isPrimaryKey,
          isNotNull,
          isUnique
        });
        columnsList.push(colName);

        const nextPunc = this.peek();
        if (nextPunc && nextPunc.type === 'PUNCTUATION' && nextPunc.value === ',') {
          this.next(); // ','
        } else if (nextPunc && nextPunc.type === 'PUNCTUATION' && nextPunc.value === ')') {
          this.next(); // ')'
          break;
        } else {
          this.error("Expected ',' or ')' in table definition");
        }
      }

      return {
        type: 'CREATE_TABLE',
        name: nameToken.value,
        columns: columnsList,
        columnDefinitions
      };
    }

    this.error("Unsupported target for CREATE: '" + target.value + "'");
  }

  parseShow() {
    this.next(); // consume SHOW
    const target = this.next();
    if (!target || target.type !== 'KEYWORD' || (target.value !== 'DATABASES' && target.value !== 'TABLES')) {
      this.error("Expected 'DATABASES' or 'TABLES' after 'SHOW'");
    }
    return { type: 'SHOW', target: target.value };
  }

  parseUse() {
    this.next(); // consume USE
    const dbToken = this.next();
    if (!dbToken || dbToken.type !== 'IDENTIFIER') {
      this.error('Expected database name');
    }
    return { type: 'USE', name: dbToken.value };
  }

  parseDrop() {
    this.next(); // consume DROP
    const target = this.next();
    if (!target || target.type !== 'KEYWORD' || (target.value !== 'DATABASE' && target.value !== 'TABLE')) {
      this.error("Expected 'DATABASE' or 'TABLE' after 'DROP'");
    }

    const nameToken = this.next();
    if (!nameToken || nameToken.type !== 'IDENTIFIER') {
      this.error(`Expected ${target.value.toLowerCase()} name to drop`);
    }

    return { type: 'DROP', target: target.value, name: nameToken.value };
  }

  parseDescribe() {
    this.next(); // consume DESCRIBE
    const nameToken = this.next();
    if (!nameToken || nameToken.type !== 'IDENTIFIER') {
      this.error('Expected table name to describe');
    }
    return { type: 'DESCRIBE', table: nameToken.value };
  }

  parseRename() {
    this.next(); // consume RENAME
    this.consumeKeyword('TABLE');
    const oldName = this.next();
    if (!oldName || oldName.type !== 'IDENTIFIER') {
      this.error('Expected source table name');
    }
    this.consumeKeyword('TO');
    const newName = this.next();
    if (!newName || newName.type !== 'IDENTIFIER') {
      this.error('Expected target table name');
    }

    return { type: 'RENAME_TABLE', from: oldName.value, to: newName.value };
  }

  parseInsert() {
    this.next(); // consume INSERT
    this.consumeKeyword('INTO');
    const tableToken = this.next();
    if (!tableToken || tableToken.type !== 'IDENTIFIER') {
      this.error('Expected table name for INSERT');
    }

    let columns = null;
    let nextTok = this.peek();
    if (nextTok && nextTok.type === 'PUNCTUATION' && nextTok.value === '(') {
      this.next(); // '('
      columns = [];
      while (true) {
        const col = this.next();
        if (!col || col.type !== 'IDENTIFIER') {
          this.error('Expected column identifier');
        }
        columns.push(col.value);

        const separator = this.next();
        if (separator.value === ')') break;
        if (separator.value !== ',') this.error("Expected ',' or ')' in columns list");
      }
    }

    this.consumeKeyword('VALUES');
    this.consumePunctuation('(');

    const values = [];
    while (true) {
      const valTok = this.next();
      const isLiteral = valTok && (
        valTok.type === 'STRING' ||
        valTok.type === 'NUMBER' ||
        valTok.value === 'NULL' ||
        (valTok.type === 'KEYWORD' && (valTok.value === 'TRUE' || valTok.value === 'FALSE'))
      );
      if (!valTok || !isLiteral) {
        this.error('Expected literal value (string, number, or NULL)');
      }

      let val = valTok.value;
      if (valTok.type === 'KEYWORD') {
        if (val === 'TRUE') val = true;
        else if (val === 'FALSE') val = false;
        else if (val === 'NULL') val = null;
      }
      values.push(val);

      const separator = this.next();
      if (separator.value === ')') break;
      if (separator.value !== ',') this.error("Expected ',' or ')' in values list");
    }

    return { type: 'INSERT', table: tableToken.value, columns, values };
  }

  parseSelectWithSetOperations() {
    let selectAST = this.parseSingleSelect();

    while (true) {
      const pk = this.peek();
      if (pk && pk.type === 'KEYWORD' && (pk.value === 'UNION' || pk.value === 'INTERSECT')) {
        const op = this.next().value;
        const rightSelect = this.parseSingleSelect();
        selectAST = {
          type: 'SET_OPERATION',
          operator: op,
          left: selectAST,
          right: rightSelect
        };
      } else {
        break;
      }
    }

    return selectAST;
  }

  parseSingleSelect() {
    this.consumeKeyword('SELECT');
    const columns = [];

    while (true) {
      let isAgg = false;
      let aggFunc = null;
      let colVal = null;
      let colAlias = null;

      const tok = this.peek();
      if (tok && tok.type === 'KEYWORD' && ['COUNT', 'AVG', 'MIN', 'MAX', 'SUM'].includes(tok.value)) {
        aggFunc = this.next().value; // function
        this.consumePunctuation('(');
        const arg = this.next();
        if (!arg || (arg.type !== 'IDENTIFIER' && arg.value !== '*')) {
          this.error("Expected identifier or '*' as aggregation argument");
        }
        colVal = arg.value;
        this.consumePunctuation(')');
        isAgg = true;
      } else {
        const colTok = this.next();
        if (!colTok || (colTok.type !== 'IDENTIFIER' && colTok.value !== '*')) {
          this.error("Expected column identifier or '*'");
        }
        colVal = colTok.value;
      }

      const aliasPk = this.peek();
      if (aliasPk && aliasPk.type === 'KEYWORD' && aliasPk.value === 'AS') {
        this.next(); // AS
        const aliasTok = this.next();
        if (!aliasTok || aliasTok.type !== 'IDENTIFIER') {
          this.error('Expected identifier after AS');
        }
        colAlias = aliasTok.value;
      } else if (aliasPk && aliasPk.type === 'IDENTIFIER') {
        colAlias = this.next().value;
      }

      columns.push({
        expr: colVal,
        alias: colAlias,
        isAgg,
        aggFunc
      });

      const nextPunc = this.peek();
      if (nextPunc && nextPunc.type === 'PUNCTUATION' && nextPunc.value === ',') {
        this.next(); // ','
      } else {
        break;
      }
    }

    this.consumeKeyword('FROM');
    const tableTok = this.next();
    if (!tableTok || tableTok.type !== 'IDENTIFIER') {
      this.error('Expected source table identifier');
    }
    const table = tableTok.value;

    let tableAlias = null;
    const potentialAlias = this.peek();
    if (
      potentialAlias &&
      potentialAlias.type === 'IDENTIFIER' &&
      !['JOIN', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT'].includes(potentialAlias.value.toUpperCase())
    ) {
      tableAlias = this.next().value;
    }

    const joins = [];
    while (true) {
      const pk = this.peek();
      let joinType = 'INNER';
      if (pk && pk.type === 'KEYWORD' && ['LEFT', 'RIGHT', 'INNER', 'JOIN'].includes(pk.value)) {
        if (pk.value !== 'JOIN') {
          joinType = this.next().value; // LEFT / RIGHT / INNER
          this.consumeKeyword('JOIN');
        } else {
          this.next(); // JOIN
        }

        const joinTableTok = this.next();
        if (!joinTableTok || joinTableTok.type !== 'IDENTIFIER') {
          this.error('Expected table to join');
        }
        const joinTable = joinTableTok.value;

        let joinTableAlias = null;
        const potentialJoinAlias = this.peek();
        if (
          potentialJoinAlias &&
          potentialJoinAlias.type === 'IDENTIFIER' &&
          !['ON', 'JOIN', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT'].includes(potentialJoinAlias.value.toUpperCase())
        ) {
          joinTableAlias = this.next().value;
        }

        this.consumeKeyword('ON');
        const cond = this.parseConditionExpr();

        joins.push({
          type: joinType,
          table: joinTable,
          alias: joinTableAlias,
          condition: cond
        });
      } else {
        break;
      }
    }

    let where = null;
    if (this.matchKeyword('WHERE')) {
      this.next(); // WHERE
      where = this.parseConditionExpr();
    }

    let groupBy = null;
    if (this.matchKeyword('GROUP')) {
      this.next(); // GROUP
      this.consumeKeyword('BY');
      const groupColTok = this.next();
      if (!groupColTok || groupColTok.type !== 'IDENTIFIER') {
        this.error('Expected column identifier for GROUP BY');
      }
      groupBy = groupColTok.value;
    }

    let orderBy = null;
    let orderDir = 'ASC';
    if (this.matchKeyword('ORDER')) {
      this.next(); // ORDER
      this.consumeKeyword('BY');
      const orderColTok = this.next();
      if (!orderColTok || orderColTok.type !== 'IDENTIFIER') {
        this.error('Expected column identifier for ORDER BY');
      }
      orderBy = orderColTok.value;

      const dirTok = this.peek();
      if (dirTok && (dirTok.value.toUpperCase() === 'ASC' || dirTok.value.toUpperCase() === 'DESC')) {
        orderDir = this.next().value.toUpperCase();
      }
    }

    let limit = null;
    if (this.matchKeyword('LIMIT')) {
      this.next(); // LIMIT
      const limitVal = this.next();
      if (!limitVal || limitVal.type !== 'NUMBER') {
        this.error('Expected integer value for LIMIT');
      }
      limit = limitVal.value;
    }

    let offset = null;
    if (this.matchKeyword('OFFSET')) {
      this.next(); // OFFSET
      const offsetVal = this.next();
      if (!offsetVal || offsetVal.type !== 'NUMBER') {
        this.error('Expected integer value for OFFSET');
      }
      offset = offsetVal.value;
    }

    return {
      type: 'SELECT',
      columns,
      table,
      tableAlias,
      joins,
      where,
      groupBy,
      orderBy,
      orderDir,
      limit,
      offset
    };
  }

  parseConditionExpr() {
    let expr = this.parseConditionTerm();

    while (true) {
      const pk = this.peek();
      if (pk && pk.type === 'KEYWORD' && pk.value === 'OR') {
        this.next(); // OR
        const right = this.parseConditionTerm();
        expr = { type: 'LOGICAL_OR', left: expr, right };
      } else {
        break;
      }
    }

    return expr;
  }

  parseConditionTerm() {
    let expr = this.parseConditionFactor();

    while (true) {
      const pk = this.peek();
      if (pk && pk.type === 'KEYWORD' && pk.value === 'AND') {
        this.next(); // AND
        const right = this.parseConditionFactor();
        expr = { type: 'LOGICAL_AND', left: expr, right };
      } else {
        break;
      }
    }

    return expr;
  }

  parseConditionFactor() {
    const pk = this.peek();

    if (pk && pk.type === 'PUNCTUATION' && pk.value === '(') {
      this.next(); // '('
      const nestedExpr = this.parseConditionExpr();
      this.consumePunctuation(')');
      return nestedExpr;
    }

    const leftTok = this.next();
    if (!leftTok || leftTok.type !== 'IDENTIFIER') {
      this.error('Expected column identifier in filter condition');
    }

    const opTok = this.next();
    if (
      !opTok ||
      (opTok.type !== 'OPERATOR' && (opTok.type !== 'KEYWORD' || (opTok.value !== 'LIKE' && opTok.value !== 'CONTAINS' && opTok.value !== 'IN')))
    ) {
      this.error("Expected comparison operator (=, !=, >, <, LIKE, CONTAINS, IN)");
    }
    const op = opTok.value;

    const rightTok = this.peek();
    
    // Check if right value is a nested subquery SELECT e.g. col IN (SELECT ...)
    if (rightTok && rightTok.type === 'PUNCTUATION' && rightTok.value === '(') {
      this.next(); // '('
      const nextWord = this.peek();
      if (nextWord && nextWord.type === 'KEYWORD' && nextWord.value === 'SELECT') {
        const subquerySelect = this.parseSelectWithSetOperations();
        this.consumePunctuation(')');
        return {
          type: 'COMPARISON',
          left: leftTok.value,
          operator: op,
          right: subquerySelect,
          isSubquery: true
        };
      }
      this.pos--; // backtrack if not select subquery
    }

    const rightLiteral = this.next();
    const isValidRight = rightLiteral && (
      rightLiteral.type === 'STRING' ||
      rightLiteral.type === 'NUMBER' ||
      rightLiteral.type === 'IDENTIFIER' ||
      (rightLiteral.type === 'KEYWORD' && (rightLiteral.value === 'TRUE' || rightLiteral.value === 'FALSE' || rightLiteral.value === 'NULL'))
    );
    if (!isValidRight) {
      this.error('Expected comparison literal value');
    }

    let rightVal = rightLiteral.value;
    if (rightLiteral.type === 'KEYWORD') {
      if (rightVal === 'TRUE') rightVal = true;
      else if (rightVal === 'FALSE') rightVal = false;
      else if (rightVal === 'NULL') rightVal = null;
    }

    return {
      type: 'COMPARISON',
      left: leftTok.value,
      operator: op,
      right: rightVal
    };
  }

  parseUpdate() {
    this.next(); // UPDATE
    const tableTok = this.next();
    if (!tableTok || tableTok.type !== 'IDENTIFIER') {
      this.error('Expected table identifier for UPDATE');
    }

    this.consumeKeyword('SET');

    const sets = [];
    while (true) {
      const colTok = this.next();
      if (!colTok || colTok.type !== 'IDENTIFIER') {
        this.error('Expected column name in SET clause');
      }

      this.matchOperator('=') ? this.next() : this.error("Expected '=' after column name in SET clause");

      const valTok = this.next();
      const isLiteral = valTok && (
        valTok.type === 'STRING' ||
        valTok.type === 'NUMBER' ||
        valTok.value === 'NULL' ||
        (valTok.type === 'KEYWORD' && (valTok.value === 'TRUE' || valTok.value === 'FALSE'))
      );
      if (!valTok || !isLiteral) {
        this.error('Expected literal value (string, number, or NULL)');
      }

      let val = valTok.value;
      if (valTok.type === 'KEYWORD') {
        if (val === 'TRUE') val = true;
        else if (val === 'FALSE') val = false;
        else if (val === 'NULL') val = null;
      }

      sets.push({
        column: colTok.value,
        value: val
      });

      const nextTok = this.peek();
      if (nextTok && nextTok.type === 'PUNCTUATION' && nextTok.value === ',') {
        this.next(); // ','
      } else {
        break;
      }
    }

    let where = null;
    if (this.matchKeyword('WHERE')) {
      this.next(); // WHERE
      where = this.parseConditionExpr();
    }

    return { type: 'UPDATE', table: tableTok.value, sets, where };
  }

  parseDelete() {
    this.next(); // DELETE
    this.consumeKeyword('FROM');
    const tableTok = this.next();
    if (!tableTok || tableTok.type !== 'IDENTIFIER') {
      this.error('Expected table identifier for DELETE');
    }

    let where = null;
    if (this.matchKeyword('WHERE')) {
      this.next(); // WHERE
      where = this.parseConditionExpr();
    }

    return { type: 'DELETE', table: tableTok.value, where };
  }

  parseFind() {
    this.next(); // FIND
    this.consumeKeyword('IN');
    const tableTok = this.next();
    if (!tableTok || tableTok.type !== 'IDENTIFIER') {
      this.error('Expected table name');
    }

    this.consumeKeyword('WHERE');

    const colTok = this.next();
    if (!colTok || colTok.type !== 'IDENTIFIER') {
      this.error('Expected object path identifier');
    }

    const opTok = this.next();
    if (!opTok || (opTok.value !== 'CONTAINS' && opTok.value !== '=')) {
      this.error("Expected operator '=' or 'CONTAINS' in FIND");
    }

    const valTok = this.next();
    if (!valTok || (valTok.type !== 'STRING' && valTok.type !== 'NUMBER')) {
      this.error('Expected comparison literal value');
    }

    return {
      type: 'FIND',
      table: tableTok.value,
      path: colTok.value,
      operator: opTok.value,
      value: valTok.value
    };
  }

  parseIndex() {
    this.next(); // INDEX
    this.consumeKeyword('CREATE');
    this.consumeKeyword('ON');

    const tableTok = this.next();
    if (!tableTok || tableTok.type !== 'IDENTIFIER') {
      this.error('Expected table name to create index on');
    }

    this.consumePunctuation('(');
    const colTok = this.next();
    if (!colTok || colTok.type !== 'IDENTIFIER') {
      this.error('Expected column identifier for index');
    }
    this.consumePunctuation(')');

    return { type: 'INDEX_CREATE', table: tableTok.value, column: colTok.value };
  }

  parseGraph() {
    this.next(); // consume GRAPH
    const action = this.next();
    if (!action || action.type !== 'KEYWORD' || (action.value !== 'LINK' && action.value !== 'TRAVERSE')) {
      this.error("Expected 'LINK' or 'TRAVERSE' after 'GRAPH'");
    }

    if (action.value === 'LINK') {
      const fromTable = this.next();
      if (!fromTable || fromTable.type !== 'IDENTIFIER') this.error('Expected source table identifier');

      this.consumePunctuation('(');
      const fromIdTok = this.next();
      if (!fromIdTok || (fromIdTok.type !== 'NUMBER' && fromIdTok.type !== 'STRING')) {
        this.error('Expected source record identifier (ID)');
      }
      this.consumePunctuation(')');

      const arrow = this.next();
      if (!arrow || arrow.type !== 'OPERATOR' || arrow.value !== '->') {
        this.error("Expected relation arrow operator '->'");
      }

      const toTable = this.next();
      if (!toTable || toTable.type !== 'IDENTIFIER') this.error('Expected destination table identifier');

      this.consumePunctuation('(');
      const toIdTok = this.next();
      if (!toIdTok || (toIdTok.type !== 'NUMBER' && toIdTok.type !== 'STRING')) {
        this.error('Expected destination record identifier (ID)');
      }
      this.consumePunctuation(')');

      this.consumeKeyword('AS');
      const labelTok = this.next();
      if (!labelTok || labelTok.type !== 'STRING') {
        this.error('Expected relationship label string (in quotes)');
      }

      return {
        type: 'GRAPH_LINK',
        fromTable: fromTable.value,
        fromId: fromIdTok.value,
        toTable: toTable.value,
        toId: toIdTok.value,
        label: labelTok.value
      };
    }

    if (action.value === 'TRAVERSE') {
      this.consumeKeyword('FROM');
      const tableTok = this.next();
      if (!tableTok || tableTok.type !== 'IDENTIFIER') this.error('Expected table identifier');

      this.consumePunctuation('(');
      const idTok = this.next();
      if (!idTok || (idTok.type !== 'NUMBER' && idTok.type !== 'STRING')) {
        this.error('Expected record ID');
      }
      this.consumePunctuation(')');

      let depth = 1;
      const nextPk = this.peek();
      if (nextPk && nextPk.type === 'KEYWORD' && nextPk.value === 'DEPTH') {
        this.next(); // consume DEPTH
        const depthTok = this.next();
        if (!depthTok || depthTok.type !== 'NUMBER') this.error('Expected integer value for DEPTH');
        depth = depthTok.value;
      }

      return {
        type: 'GRAPH_TRAVERSE',
        table: tableTok.value,
        id: idTok.value,
        depth
      };
    }

    this.error('Unsupported GRAPH command');
  }
}

// =========================================================================
// 3. EXECUTOR (AST runner supporting BOTH MongoDB & In-Memory Fallback)
// =========================================================================
class Executor {
  constructor(activeDb = null, useInMemory = false, sessionId = 'default') {
    this.activeDb = activeDb;
    this.useInMemory = useInMemory;
    this.sessionId = sessionId;
  }

  levenshteinDistance(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    return track[s2.length][s1.length];
  }

  didYouMean(word, list) {
    let closest = null;
    let minDistance = 3;
    for (const item of list) {
      const dist = this.levenshteinDistance(word, item);
      if (dist < minDistance) {
        minDistance = dist;
        closest = item;
      }
    }
    return closest;
  }

  // Session Helper for ACID Transactions
  getSession() {
    if (!global.dbSessions[this.sessionId]) {
      global.dbSessions[this.sessionId] = {
        inTransaction: false,
        buffer: [] // Array of { type: 'INSERT'|'UPDATE'|'DELETE', table, doc, sets, where }
      };
    }
    return global.dbSessions[this.sessionId];
  }

  // Helper getters abstracting DB access, supporting Transaction Isolation
  async getDatabasesList() {
    if (this.useInMemory) {
      return global.inMemoryStore.databases.map(d => d.name);
    }
    const dbs = await Database.find();
    return dbs.map(d => d.name);
  }

  async getTablesList() {
    if (this.useInMemory) {
      return global.inMemoryStore.tables.filter(t => t.database === this.activeDb);
    }
    return await Table.find({ database: this.activeDb });
  }

  async findTable(tableName) {
    if (this.useInMemory) {
      return global.inMemoryStore.tables.find(t => t.database === this.activeDb && t.name === tableName) || null;
    }
    return await Table.findOne({ database: this.activeDb, name: tableName });
  }

  async getRowsCount(tableName) {
    const rows = await this.getRowsDataWithTransaction(tableName);
    return rows.length;
  }

  async getRowsData(tableName) {
    if (this.useInMemory) {
      return global.inMemoryStore.rows.filter(r => r.database === this.activeDb && r.table === tableName);
    }
    return await Row.find({ database: this.activeDb, table: tableName });
  }

  // Merges the base database state with local active transaction session buffer (Read Uncommitted)
  async getRowsDataWithTransaction(tableName) {
    const dbRows = await this.getRowsData(tableName);
    const session = this.getSession();

    if (session && session.inTransaction) {
      // Clone rows so we don't modify database documents in memory
      let rows = dbRows.map(r => {
        const doc = typeof r.toObject === 'function' ? r.toObject() : r;
        return {
          database: doc.database,
          table: doc.table,
          data: { ...doc.data }
        };
      });
      
      for (const op of session.buffer) {
        if (op.table !== tableName) continue;
        if (op.type === 'INSERT') {
          rows.push({ database: this.activeDb, table: tableName, data: { ...op.doc } });
        } else if (op.type === 'UPDATE') {
          for (const r of rows) {
            if (await this.evalWhere(r.data, op.where)) {
              op.sets.forEach(s => {
                r.data[s.column] = s.value;
              });
            }
          }
        } else if (op.type === 'DELETE') {
          const filtered = [];
          for (const r of rows) {
            if (!(await this.evalWhere(r.data, op.where))) {
              filtered.push(r);
            }
          }
          rows = filtered;
        }
      }
      return rows;
    }
    return dbRows;
  }

  // Schema Constraint checking
  validateRowConstraints(tbl, doc, isUpdate = false) {
    const defs = tbl.columnDefinitions || [];
    defs.forEach(def => {
      const val = doc[def.name];
      
      // 1. Not Null check
      if (def.isNotNull) {
        if (isUpdate) {
          if (val === null) {
            throw new Error(`Integrity constraint violation: Column '${def.name}' cannot be NULL`);
          }
        } else {
          if (val === undefined || val === null) {
            throw new Error(`Integrity constraint violation: Column '${def.name}' cannot be NULL`);
          }
        }
      }

      // 2. Data Type checks and coercion
      if (val !== undefined && val !== null) {
        const strVal = String(val);
        if (def.type === 'INT' || def.type === 'INTEGER') {
          if (isNaN(Number(val)) || !Number.isInteger(Number(val))) {
            throw new Error(`Type mismatch error: Value '${val}' is not a valid integer for column '${def.name}'`);
          }
          doc[def.name] = parseInt(val, 10);
        } else if (['DECIMAL', 'DOUBLE', 'FLOAT'].includes(def.type)) {
          if (isNaN(Number(val))) {
            throw new Error(`Type mismatch error: Value '${val}' is not a valid decimal/number for column '${def.name}'`);
          }
          doc[def.name] = parseFloat(val);
        } else if (def.type === 'BOOLEAN') {
          if (typeof val !== 'boolean') {
            if (strVal.toLowerCase() === 'true' || val === 1 || val === '1') doc[def.name] = true;
            else if (strVal.toLowerCase() === 'false' || val === 0 || val === '0') doc[def.name] = false;
            else throw new Error(`Type mismatch error: Value '${val}' is not a valid boolean for column '${def.name}'`);
          }
        }
      }
    });
  }

  async evalComparison(row, leftPath, operator, rightVal) {
    const getVal = (obj, path) => {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (part.includes('[') && part.includes(']')) {
          const idxStart = part.indexOf('[');
          const arrayName = part.substring(0, idxStart);
          const idx = parseInt(part.substring(idxStart + 1, part.length - 1), 10);
          current = current[arrayName];
          if (Array.isArray(current)) current = current[idx];
          else return undefined;
        } else {
          current = current[part];
        }
      }
      return current;
    };

    let leftVal = getVal(row, leftPath);

    // SQL Subquery Execution Logic
    if (rightVal && typeof rightVal === 'object' && rightVal.type === 'SELECT') {
      const subExecutor = new Executor(this.activeDb, this.useInMemory, this.sessionId);
      const subResult = await subExecutor.execute(rightVal);
      
      if (subResult && subResult.rows) {
        const columnValues = subResult.rows.map(r => r[0]);
        if (operator.toUpperCase() === 'IN') {
          return columnValues.map(String).includes(String(leftVal));
        } else {
          const singleVal = columnValues[0];
          return String(leftVal) === String(singleVal);
        }
      }
      return false;
    }

    if (typeof rightVal === 'string' && !rightVal.startsWith('"') && !rightVal.startsWith("'")) {
      if (row[rightVal] !== undefined) rightVal = row[rightVal];
    }

    if (leftVal === undefined) return false;

    switch (operator.toUpperCase()) {
      case '=':
        return String(leftVal) === String(rightVal);
      case '!=':
      case '<>':
        return String(leftVal) !== String(rightVal);
      case '>':
        return Number(leftVal) > Number(rightVal);
      case '<':
        return Number(leftVal) < Number(rightVal);
      case '>=':
        return Number(leftVal) >= Number(rightVal);
      case '<=':
        return Number(leftVal) <= Number(rightVal);
      case 'LIKE': {
        const pattern = String(rightVal).replace(/%/g, '.*').replace(/_/g, '.');
        const regex = new RegExp(`^${pattern}$`, 'i');
        return regex.test(String(leftVal));
      }
      case 'CONTAINS':
        if (Array.isArray(leftVal)) {
          return leftVal.map(String).includes(String(rightVal));
        }
        return String(leftVal).includes(String(rightVal));
      default:
        return false;
    }
  }

  async evalWhere(row, node) {
    if (!node) return true;
    if (node.type === 'COMPARISON') {
      return await this.evalComparison(row, node.left, node.operator, node.right);
    }
    if (node.type === 'LOGICAL_AND') {
      return (await this.evalWhere(row, node.left)) && (await this.evalWhere(row, node.right));
    }
    if (node.type === 'LOGICAL_OR') {
      return (await this.evalWhere(row, node.left)) || (await this.evalWhere(row, node.right));
    }
    return false;
  }

  async execute(ast) {
    const startTime = Date.now();
    let result = null;

    try {
      switch (ast.type) {
        case 'BEGIN_TRANSACTION':
          result = await this.executeBeginTransaction();
          break;
        case 'COMMIT':
          result = await this.executeCommit();
          break;
        case 'ROLLBACK':
          result = await this.executeRollback();
          break;
        case 'CREATE_DATABASE':
          result = await this.executeCreateDatabase(ast.name);
          break;
        case 'SHOW':
          result = await this.executeShow(ast.target);
          break;
        case 'USE':
          result = await this.executeUse(ast.name);
          break;
        case 'DROP':
          result = await this.executeDrop(ast.target, ast.name);
          break;
        case 'CREATE_TABLE':
          result = await this.executeCreateTable(ast.name, ast.columns, ast.columnDefinitions);
          break;
        case 'DESCRIBE':
          result = await this.executeDescribe(ast.table);
          break;
        case 'RENAME_TABLE':
          result = await this.executeRenameTable(ast.from, ast.to);
          break;
        case 'INSERT':
          result = await this.executeInsert(ast.table, ast.columns, ast.values);
          break;
        case 'SELECT':
          result = await this.executeSelect(ast);
          break;
        case 'SET_OPERATION':
          result = await this.executeSetOperation(ast);
          break;
        case 'UPDATE':
          result = await this.executeUpdate(ast.table, ast.sets, ast.where);
          break;
        case 'DELETE':
          result = await this.executeDelete(ast.table, ast.where);
          break;
        case 'FIND':
          result = await this.executeFind(ast.table, ast.path, ast.operator, ast.value);
          break;
        case 'INDEX_CREATE':
          result = await this.executeCreateIndex(ast.table, ast.column);
          break;
        case 'GRAPH_LINK':
          result = await this.executeGraphLink(ast);
          break;
        case 'GRAPH_TRAVERSE':
          result = await this.executeGraphTraverse(ast);
          break;
        default:
          throw new Error(`Execution error: Unknown AST command node '${ast.type}'`);
      }

      const duration = Date.now() - startTime;
      
      if (!this.useInMemory) {
        await new History({
          query: JSON.stringify(ast),
          executionTimeMs: duration,
          success: true
        }).save();
      } else {
        global.inMemoryStore.history.push({
          query: JSON.stringify(ast),
          timestamp: new Date(),
          executionTimeMs: duration,
          success: true,
          error: null
        });
      }

      return {
        success: true,
        executionTimeMs: duration,
        ...result
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      if (!this.useInMemory) {
        await new History({
          query: JSON.stringify(ast),
          executionTimeMs: duration,
          success: false,
          error: err.message
        }).save();
      } else {
        global.inMemoryStore.history.push({
          query: JSON.stringify(ast),
          timestamp: new Date(),
          executionTimeMs: duration,
          success: false,
          error: err.message
        });
      }
      throw err;
    }
  }

  // Transaction Handler methods
  async executeBeginTransaction() {
    const session = this.getSession();
    if (session.inTransaction) {
      throw new Error('Transaction context error: A transaction is already active in this tab session');
    }
    session.inTransaction = true;
    session.buffer = [];
    return {
      message: 'Transaction started. Sandbox write-ahead buffer initialized.',
      inTransaction: true,
      columns: ['status'],
      rows: [['Transaction started']],
      rowsAffected: 1
    };
  }

  async executeCommit() {
    const session = this.getSession();
    if (!session.inTransaction) {
      throw new Error('Transaction context error: No active transaction to commit');
    }

    let affectedCount = 0;
    
    // Apply buffered writes to MongoDB / In-memory store
    for (const op of session.buffer) {
      if (op.type === 'INSERT') {
        if (this.useInMemory) {
          global.inMemoryStore.rows.push({ database: this.activeDb, table: op.table, data: op.doc });
        } else {
          await new Row({ database: this.activeDb, table: op.table, data: op.doc }).save();
        }
        affectedCount++;
      } else if (op.type === 'UPDATE') {
        if (this.useInMemory) {
          for (const r of global.inMemoryStore.rows) {
            if (r.database === this.activeDb && r.table === op.table && (await this.evalWhere(r.data, op.where))) {
              op.sets.forEach(s => { r.data[s.column] = s.value; });
              affectedCount++;
            }
          }
        } else {
          const allRows = await Row.find({ database: this.activeDb, table: op.table });
          for (const r of allRows) {
            if (await this.evalWhere(r.data, op.where)) {
              op.sets.forEach(s => { r.data[s.column] = s.value; });
              r.markModified('data');
              await r.save();
              affectedCount++;
            }
          }
        }
      } else if (op.type === 'DELETE') {
        if (this.useInMemory) {
          const remainingRows = [];
          for (const r of global.inMemoryStore.rows) {
            if (r.database === this.activeDb && r.table === op.table && (await this.evalWhere(r.data, op.where))) {
              continue;
            }
            remainingRows.push(r);
          }
          affectedCount += (global.inMemoryStore.rows.length - remainingRows.length);
          global.inMemoryStore.rows = remainingRows;
        } else {
          const allRows = await Row.find({ database: this.activeDb, table: op.table });
          for (const r of allRows) {
            if (await this.evalWhere(r.data, op.where)) {
              await Row.deleteOne({ _id: r._id });
              affectedCount++;
            }
          }
        }
      }
    }

    session.inTransaction = false;
    session.buffer = [];

    return {
      message: `Transaction committed successfully. ${affectedCount} modifications written.`,
      inTransaction: false,
      columns: ['status', 'rows_affected'],
      rows: [[`Transaction Committed`, affectedCount]],
      rowsAffected: affectedCount
    };
  }

  async executeRollback() {
    const session = this.getSession();
    if (!session.inTransaction) {
      throw new Error('Transaction context error: No active transaction to rollback');
    }

    const discardedCount = session.buffer.length;
    session.inTransaction = false;
    session.buffer = [];

    return {
      message: `Transaction rolled back. ${discardedCount} pending modifications discarded.`,
      inTransaction: false,
      columns: ['status', 'buffer_cleared'],
      rows: [[`Transaction Rolled Back`, discardedCount]],
      rowsAffected: discardedCount
    };
  }

  async executeCreateDatabase(name) {
    const list = await this.getDatabasesList();
    if (list.includes(name)) {
      throw new Error(`Database '${name}' already exists`);
    }

    if (this.useInMemory) {
      global.inMemoryStore.databases.push({ name, createdAt: new Date() });
    } else {
      await new Database({ name }).save();
    }

    return {
      message: `Database '${name}' created successfully`,
      rowsAffected: 1,
      columns: ['status'],
      rows: [[`Database '${name}' created`]]
    };
  }

  async executeShow(target) {
    if (target === 'DATABASES') {
      let rows = [];
      if (this.useInMemory) {
        rows = global.inMemoryStore.databases.map(d => [d.name, d.createdAt.toISOString()]);
      } else {
        const dbs = await Database.find();
        rows = dbs.map(db => [db.name, db.createdAt.toISOString()]);
      }
      return {
        columns: ['database_name', 'created_at'],
        rows,
        rowsAffected: rows.length
      };
    }

    if (target === 'TABLES') {
      if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

      const tables = await this.getTablesList();
      const rows = [];
      for (const t of tables) {
        const count = await this.getRowsCount(t.name);
        rows.push([t.name, count]);
      }

      return {
        columns: ['table_name', 'row_count'],
        rows,
        rowsAffected: tables.length
      };
    }
  }

  async executeUse(name) {
    const list = await this.getDatabasesList();
    if (!list.includes(name)) {
      const suggested = this.didYouMean(name, list);
      const suggestMsg = suggested ? ` Did you mean '${suggested}'?` : '';
      throw new Error(`Database '${name}' not found.${suggestMsg}`);
    }
    this.activeDb = name;
    return {
      message: `Switched database context to '${name}'`,
      activeDatabase: name,
      columns: ['active_database'],
      rows: [[name]],
      rowsAffected: 1
    };
  }

  async executeDrop(target, name) {
    if (target === 'DATABASE') {
      const list = await this.getDatabasesList();
      if (!list.includes(name)) throw new Error(`Database '${name}' does not exist`);

      if (this.useInMemory) {
        global.inMemoryStore.databases = global.inMemoryStore.databases.filter(d => d.name !== name);
        global.inMemoryStore.tables = global.inMemoryStore.tables.filter(t => t.database !== name);
        global.inMemoryStore.rows = global.inMemoryStore.rows.filter(r => r.database !== name);
        global.inMemoryStore.relationships = global.inMemoryStore.relationships.filter(r => r.database !== name);
      } else {
        await Database.deleteOne({ name });
        await Table.deleteMany({ database: name });
        await Row.deleteMany({ database: name });
        await Relationship.deleteMany({ database: name });
      }

      const switchBack = this.activeDb === name ? null : this.activeDb;
      this.activeDb = switchBack;

      return {
        message: `Database '${name}' dropped successfully`,
        activeDatabase: switchBack,
        columns: ['status'],
        rows: [[`Dropped database '${name}'`]],
        rowsAffected: 1
      };
    }

    if (target === 'TABLE') {
      if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

      const table = await this.findTable(name);
      if (!table) {
        const list = (await this.getTablesList()).map(t => t.name);
        const suggested = this.didYouMean(name, list);
        const suggestMsg = suggested ? ` Did you mean '${suggested}'?` : '';
        throw new Error(`Table '${name}' does not exist.${suggestMsg}`);
      }

      let removedCount = 0;
      if (this.useInMemory) {
        global.inMemoryStore.tables = global.inMemoryStore.tables.filter(t => !(t.database === this.activeDb && t.name === name));
        const beforeLen = global.inMemoryStore.rows.length;
        global.inMemoryStore.rows = global.inMemoryStore.rows.filter(r => !(r.database === this.activeDb && r.table === name));
        removedCount = beforeLen - global.inMemoryStore.rows.length;
      } else {
        await Table.deleteOne({ database: this.activeDb, name });
        const del = await Row.deleteMany({ database: this.activeDb, table: name });
        removedCount = del.deletedCount;
      }

      return {
        message: `Table '${name}' dropped successfully`,
        columns: ['status'],
        rows: [[`Dropped table '${name}' (${removedCount} rows removed)`]],
        rowsAffected: 1
      };
    }
  }

  async executeCreateTable(name, columns, columnDefinitions) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const exists = await this.findTable(name);
    if (exists) {
      throw new Error(`Table '${name}' already exists in database '${this.activeDb}'`);
    }

    if (this.useInMemory) {
      global.inMemoryStore.tables.push({
        database: this.activeDb,
        name,
        columns,
        columnDefinitions,
        indexes: ['id']
      });
    } else {
      await new Table({
        database: this.activeDb,
        name,
        columns,
        columnDefinitions,
        indexes: ['id']
      }).save();
    }

    return {
      message: `Table '${name}' created successfully with constraints`,
      columns: ['status'],
      rows: [[`Created table '${name}'`]],
      rowsAffected: 1
    };
  }

  async executeDescribe(tableName) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(tableName);
    if (!tbl) {
      const list = (await this.getTablesList()).map(t => t.name);
      const suggested = this.didYouMean(tableName, list);
      const suggestMsg = suggested ? ` Did you mean '${suggested}'?` : '';
      throw new Error(`Table '${tableName}' not found.${suggestMsg}`);
    }

    const rows = tbl.columnDefinitions ? tbl.columnDefinitions.map(def => [
      def.name,
      def.type,
      def.isPrimaryKey ? 'PRIMARY KEY' : def.isNotNull ? 'NOT NULL' : 'NULL',
      tbl.indexes.includes(def.name) ? 'INDEXED' : 'NONE'
    ]) : tbl.columns.map(col => [col, 'VARCHAR', 'NULL', tbl.indexes.includes(col) ? 'INDEXED' : 'NONE']);

    return {
      columns: ['column_name', 'data_type', 'constraints', 'indexing'],
      rows,
      rowsAffected: rows.length
    };
  }

  async executeRenameTable(from, to) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(from);
    if (!tbl) throw new Error(`Source table '${from}' does not exist`);

    const destExists = await this.findTable(to);
    if (destExists) throw new Error(`Target table '${to}' already exists`);

    let affected = 0;
    if (this.useInMemory) {
      tbl.name = to;
      global.inMemoryStore.rows.forEach(r => {
        if (r.database === this.activeDb && r.table === from) {
          r.table = to;
          affected++;
        }
      });
    } else {
      tbl.name = to;
      await tbl.save();
      const result = await Row.updateMany(
        { database: this.activeDb, table: from },
        { $set: { table: to } }
      );
      affected = result.modifiedCount;
    }

    return {
      message: `Table '${from}' renamed to '${to}' successfully`,
      columns: ['status'],
      rows: [[`Renamed table '${from}' to '${to}' (${affected} rows updated)`]],
      rowsAffected: 1
    };
  }

  async executeInsert(tableName, columns, values) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(tableName);
    if (!tbl) {
      const list = (await this.getTablesList()).map(t => t.name);
      const suggested = this.didYouMean(tableName, list);
      const suggestMsg = suggested ? ` Did you mean '${suggested}'?` : '';
      throw new Error(`Table '${tableName}' does not exist.${suggestMsg}`);
    }

    const doc = {};
    if (columns) {
      if (columns.length !== values.length) {
        throw new Error('INSERT query error: Column count does not match values count');
      }
      columns.forEach((col, idx) => {
        doc[col] = values[idx];
      });
    } else {
      if (values.length > tbl.columns.length) {
        throw new Error(`INSERT query error: Too many values. Table has only ${tbl.columns.length} columns.`);
      }
      tbl.columns.forEach((col, idx) => {
        doc[col] = idx < values.length ? values[idx] : null;
      });
    }

    // Auto-Increment ID if missing
    if (doc.id === undefined || doc.id === null) {
      const allRows = await this.getRowsDataWithTransaction(tableName);
      const maxId = allRows.reduce((max, r) => (r.data && typeof r.data.id === 'number' ? Math.max(max, r.data.id) : max), 0);
      doc.id = maxId > 0 ? maxId + 1 : Date.now();
    }

    // Strict Type Checking and Constraints validations
    this.validateRowConstraints(tbl, doc, false);

    // Primary Key Uniqueness check
    const pkDef = tbl.columnDefinitions ? tbl.columnDefinitions.find(d => d.isPrimaryKey) : null;
    if (pkDef) {
      const pkVal = doc[pkDef.name];
      const allRows = await this.getRowsDataWithTransaction(tableName);
      const exists = allRows.find(r => r.data[pkDef.name] == pkVal);
      if (exists) {
        throw new Error(`Integrity constraint violation: PRIMARY KEY '${pkVal}' already exists in table '${tableName}'`);
      }
    }

    // Unique Constraint checks
    const uniqueDefs = tbl.columnDefinitions ? tbl.columnDefinitions.filter(d => d.isUnique && !d.isPrimaryKey) : [];
    for (const def of uniqueDefs) {
      const uVal = doc[def.name];
      if (uVal !== undefined && uVal !== null) {
        const allRows = await this.getRowsDataWithTransaction(tableName);
        const exists = allRows.find(r => r.data[def.name] == uVal);
        if (exists) {
          throw new Error(`Integrity constraint violation: UNIQUE constraint key value '${uVal}' already exists on column '${def.name}'`);
        }
      }
    }

    // Session Transaction Router
    const session = this.getSession();
    if (session.inTransaction) {
      session.buffer.push({
        type: 'INSERT',
        table: tableName,
        doc
      });
      return {
        message: `Row staged in transaction buffer for '${tableName}'`,
        columns: ['id', 'status'],
        rows: [[doc.id, 'Staged']],
        rowsAffected: 1
      };
    }

    if (this.useInMemory) {
      global.inMemoryStore.rows.push({
        database: this.activeDb,
        table: tableName,
        data: doc
      });
    } else {
      await new Row({
        database: this.activeDb,
        table: tableName,
        data: doc
      }).save();
    }

    return {
      message: `Row inserted successfully into '${tableName}'`,
      columns: ['id', 'status'],
      rows: [[doc.id, 'Inserted']],
      rowsAffected: 1
    };
  }

  async executeSelect(ast) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const mainTable = await this.findTable(ast.table);
    if (!mainTable) {
      const list = (await this.getTablesList()).map(t => t.name);
      const suggested = this.didYouMean(ast.table, list);
      const suggestMsg = suggested ? ` Did you mean '${suggested}'?` : '';
      throw new Error(`Table '${ast.table}' does not exist.${suggestMsg}`);
    }

    const mainRowsData = await this.getRowsDataWithTransaction(ast.table);
    let dataset = mainRowsData.map(r => {
      const obj = { ...r.data };
      if (ast.tableAlias) {
        Object.keys(r.data).forEach(k => {
          obj[`${ast.tableAlias}.${k}`] = r.data[k];
        });
      }
      Object.keys(r.data).forEach(k => {
        obj[`${ast.table}.${k}`] = r.data[k];
      });
      return obj;
    });

    // Joins evaluations with transaction buffers
    for (const join of ast.joins) {
      const joinTbl = await this.findTable(join.table);
      if (!joinTbl) throw new Error(`Table in join clause '${join.table}' does not exist`);

      const joinRowsData = await this.getRowsDataWithTransaction(join.table);
      const joinDataset = joinRowsData.map(r => {
        const obj = { ...r.data };
        if (join.alias) {
          Object.keys(r.data).forEach(k => {
            obj[`${join.alias}.${k}`] = r.data[k];
          });
        }
        Object.keys(r.data).forEach(k => {
          obj[`${join.table}.${k}`] = r.data[k];
        });
        return obj;
      });

      const nextDataset = [];
      if (join.type === 'INNER') {
        for (const leftRow of dataset) {
          for (const rightRow of joinDataset) {
            const combined = { ...leftRow, ...rightRow };
            if (await this.evalWhere(combined, join.condition)) {
              nextDataset.push(combined);
            }
          }
        }
      } else if (join.type === 'LEFT') {
        for (const leftRow of dataset) {
          let matchFound = false;
          for (const rightRow of joinDataset) {
            const combined = { ...leftRow, ...rightRow };
            if (await this.evalWhere(combined, join.condition)) {
              nextDataset.push(combined);
              matchFound = true;
            }
          }
          if (!matchFound) {
            const nullFilled = {};
            joinTbl.columns.forEach(col => {
              if (join.alias) nullFilled[`${join.alias}.${col}`] = null;
              nullFilled[`${join.table}.${col}`] = null;
              nullFilled[col] = null;
            });
            nextDataset.push({ ...leftRow, ...nullFilled });
          }
        }
      } else if (join.type === 'RIGHT') {
        for (const rightRow of joinDataset) {
          let matchFound = false;
          for (const leftRow of dataset) {
            const combined = { ...leftRow, ...rightRow };
            if (await this.evalWhere(combined, join.condition)) {
              nextDataset.push(combined);
              matchFound = true;
            }
          }
          if (!matchFound) {
            const nullFilled = {};
            mainTable.columns.forEach(col => {
              if (ast.tableAlias) nullFilled[`${ast.tableAlias}.${col}`] = null;
              nullFilled[`${ast.table}.${col}`] = null;
              nullFilled[col] = null;
            });
            nextDataset.push({ ...rightRow, ...nullFilled });
          }
        }
      }
      dataset = nextDataset;
    }

    // WHERE evaluations
    if (ast.where) {
      const temp = [];
      for (const row of dataset) {
        if (await this.evalWhere(row, ast.where)) temp.push(row);
      }
      dataset = temp;
    }

    let finalRows = [];
    let headers = [];

    const resolveColVal = (row, colExpr) => {
      if (row[colExpr] !== undefined) return row[colExpr];
      if (colExpr.includes('.')) {
        const rawKey = colExpr.split('.')[1];
        if (row[rawKey] !== undefined) return row[rawKey];
      }
      return null;
    };

    const isGroupQuery = ast.groupBy !== null || ast.columns.some(c => c.isAgg);

    if (isGroupQuery) {
      const buckets = {};
      const grpKey = ast.groupBy;

      dataset.forEach(row => {
        const bucketVal = grpKey ? resolveColVal(row, grpKey) : 'SINGLE_GROUP';
        if (!buckets[bucketVal]) buckets[bucketVal] = [];
        buckets[bucketVal].push(row);
      });

      headers = ast.columns.map(c => {
        if (c.alias) return c.alias;
        if (c.isAgg) return `${c.aggFunc}(${c.expr})`;
        return c.expr;
      });

      Object.keys(buckets).forEach(bKey => {
        const bucketRows = buckets[bKey];
        const resultRow = ast.columns.map(c => {
          if (c.isAgg) {
            const func = c.aggFunc.toUpperCase();
            if (func === 'COUNT') {
              if (c.expr === '*') return bucketRows.length;
              return bucketRows.filter(r => resolveColVal(r, c.expr) !== null).length;
            }

            const nums = bucketRows
              .map(r => Number(resolveColVal(r, c.expr)))
              .filter(n => !isNaN(n) && n !== null);

            if (nums.length === 0) return null;

            if (func === 'AVG') return nums.reduce((sum, n) => sum + n, 0) / nums.length;
            if (func === 'SUM') return nums.reduce((sum, n) => sum + n, 0);
            if (func === 'MIN') return Math.min(...nums);
            if (func === 'MAX') return Math.max(...nums);
          } else {
            return bKey === 'SINGLE_GROUP' ? null : resolveColVal(bucketRows[0], c.expr);
          }
        });

        finalRows.push(resultRow);
      });
    } else {
      const selectAll = ast.columns.some(c => c.expr === '*');
      if (selectAll) {
        const allKeys = new Set();
        dataset.forEach(row => {
          Object.keys(row).forEach(k => {
            if (ast.joins.length > 0) {
              allKeys.add(k);
            } else {
              if (!k.includes('.')) allKeys.add(k);
            }
          });
        });
        headers = Array.from(allKeys);
      } else {
        headers = ast.columns.map(c => c.alias || c.expr);
      }

      finalRows = dataset.map(row => {
        if (selectAll) {
          return headers.map(h => (row[h] !== undefined ? row[h] : null));
        }
        return ast.columns.map(c => resolveColVal(row, c.expr));
      });
    }

    if (ast.orderBy) {
      const ordIdx = headers.indexOf(ast.orderBy);
      if (ordIdx !== -1) {
        finalRows.sort((a, b) => {
          let valA = a[ordIdx];
          let valB = b[ordIdx];
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          if (typeof valA === 'number' && typeof valB === 'number') {
            return ast.orderDir === 'DESC' ? valB - valA : valA - valB;
          }
          return ast.orderDir === 'DESC'
            ? String(valB).localeCompare(String(valA))
            : String(valA).localeCompare(String(valB));
        });
      }
    }

    const startIdx = ast.offset || 0;
    const endIdx = ast.limit !== null ? startIdx + ast.limit : finalRows.length;
    finalRows = finalRows.slice(startIdx, endIdx);

    return {
      columns: headers,
      rows: finalRows,
      rowsAffected: finalRows.length
    };
  }

  async executeSetOperation(ast) {
    const leftRes = await this.executeSelect(ast.left);
    const rightRes = await this.executeSelect(ast.right);

    if (leftRes.columns.length !== rightRes.columns.length) {
      throw new Error('Set operation error: Queries must return the same number of columns');
    }

    const headers = leftRes.columns;
    let finalRows = [];
    const stringifyRow = r => JSON.stringify(r);

    if (ast.operator === 'UNION') {
      const seen = new Set();
      leftRes.rows.forEach(r => {
        const s = stringifyRow(r);
        if (!seen.has(s)) {
          seen.add(s);
          finalRows.push(r);
        }
      });
      rightRes.rows.forEach(r => {
        const s = stringifyRow(r);
        if (!seen.has(s)) {
          seen.add(s);
          finalRows.push(r);
        }
      });
    } else if (ast.operator === 'INTERSECT') {
      const leftSet = new Set(leftRes.rows.map(stringifyRow));
      const rightSet = new Set(rightRes.rows.map(stringifyRow));
      const intersection = [...leftSet].filter(x => rightSet.has(x));
      finalRows = intersection.map(s => JSON.parse(s));
    }

    return {
      columns: headers,
      rows: finalRows,
      rowsAffected: finalRows.length
    };
  }

  async executeUpdate(tableName, sets, where) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(tableName);
    if (!tbl) throw new Error(`Table '${tableName}' does not exist`);

    // Fetch active rows including transaction buffer
    const allRows = await this.getRowsDataWithTransaction(tableName);
    let affectedCount = 0;

    // Validate type checks for updates
    const docKeys = sets.reduce((acc, s) => { acc[s.column] = s.value; return acc; }, {});
    this.validateRowConstraints(tbl, docKeys, true);

    const session = this.getSession();
    if (session.inTransaction) {
      session.buffer.push({
        type: 'UPDATE',
        table: tableName,
        sets,
        where
      });
      
      // Determine how many staged rows would match this update
      for (const r of allRows) {
        if (await this.evalWhere(r.data, where)) affectedCount++;
      }

      return {
        message: `Update statement staged in connection buffer. ${affectedCount} rows matching.`,
        columns: ['status', 'rows_staged'],
        rows: [[`Staged Update`, affectedCount]],
        rowsAffected: affectedCount
      };
    }

    const dbRows = await this.getRowsData(tableName);
    for (const r of dbRows) {
      if (await this.evalWhere(r.data, where)) {
        sets.forEach(s => {
          r.data[s.column] = s.value;
        });
        affectedCount++;

        if (!this.useInMemory) {
          r.markModified('data');
          await r.save();
        }
      }
    }

    return {
      message: `Table '${tableName}' updated successfully. ${affectedCount} rows affected.`,
      columns: ['status', 'rows_affected'],
      rows: [[`Updated '${tableName}'`, affectedCount]],
      rowsAffected: affectedCount
    };
  }

  async executeDelete(tableName, where) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(tableName);
    if (!tbl) throw new Error(`Table '${tableName}' does not exist`);

    const allRows = await this.getRowsDataWithTransaction(tableName);
    let affectedCount = 0;

    const session = this.getSession();
    if (session.inTransaction) {
      session.buffer.push({
        type: 'DELETE',
        table: tableName,
        where
      });

      for (const r of allRows) {
        if (await this.evalWhere(r.data, where)) affectedCount++;
      }

      return {
        message: `Delete statement staged in connection buffer. ${affectedCount} rows matching.`,
        columns: ['status', 'rows_staged'],
        rows: [[`Staged Delete`, affectedCount]],
        rowsAffected: affectedCount
      };
    }

    if (this.useInMemory) {
      const beforeLen = global.inMemoryStore.rows.length;
      const remainingRows = [];
      for (const r of global.inMemoryStore.rows) {
        if (r.database === this.activeDb && r.table === tableName && (await this.evalWhere(r.data, where))) {
          continue;
        }
        remainingRows.push(r);
      }
      global.inMemoryStore.rows = remainingRows;
      affectedCount = beforeLen - global.inMemoryStore.rows.length;
    } else {
      const dbRows = await Row.find({ database: this.activeDb, table: tableName });
      for (const r of dbRows) {
        if (await this.evalWhere(r.data, where)) {
          await Row.deleteOne({ _id: r._id });
          affectedCount++;
        }
      }
    }

    return {
      message: `Table '${tableName}': Deleted ${affectedCount} rows.`,
      columns: ['status', 'rows_deleted'],
      rows: [[`Deleted from '${tableName}'`, affectedCount]],
      rowsAffected: affectedCount
    };
  }

  async executeFind(tableName, path, operator, value) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(tableName);
    if (!tbl) throw new Error(`Table '${tableName}' does not exist`);

    const allRows = await this.getRowsDataWithTransaction(tableName);
    const matched = allRows.filter(r => this.evalComparison(r.data, path, operator, value));

    const headers = tbl.columns;
    const finalRows = matched.map(r => headers.map(h => (r.data[h] !== undefined ? r.data[h] : null)));

    return {
      columns: headers,
      rows: finalRows,
      rowsAffected: finalRows.length
    };
  }

  async executeCreateIndex(tableName, column) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const tbl = await this.findTable(tableName);
    if (!tbl) throw new Error(`Table '${tableName}' does not exist`);

    if (!tbl.columns.includes(column)) {
      throw new Error(`Column '${column}' does not exist on table '${tableName}'`);
    }

    if (tbl.indexes.includes(column)) {
      return {
        message: `Index on '${tableName}(${column})' already exists`,
        columns: ['status'],
        rows: [['Index exists']],
        rowsAffected: 0
      };
    }

    tbl.indexes.push(column);
    if (!this.useInMemory) {
      await tbl.save();
    }

    return {
      message: `Created index on '${tableName}(${column})' successfully`,
      columns: ['status'],
      rows: [[`Index created on ${tableName}(${column})`]],
      rowsAffected: 1
    };
  }

  async executeGraphLink(ast) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    const fromTbl = await this.findTable(ast.fromTable);
    const toTbl = await this.findTable(ast.toTable);
    if (!fromTbl) throw new Error(`Source table '${ast.fromTable}' does not exist`);
    if (!toTbl) throw new Error(`Destination table '${ast.toTable}' does not exist`);

    let fromNode = null;
    let toNode = null;

    if (this.useInMemory) {
      fromNode = global.inMemoryStore.rows.find(r => r.database === this.activeDb && r.table === ast.fromTable && r.data.id == ast.fromId);
      toNode = global.inMemoryStore.rows.find(r => r.database === this.activeDb && r.table === ast.toTable && r.data.id == ast.toId);
    } else {
      fromNode = await Row.findOne({ database: this.activeDb, table: ast.fromTable, 'data.id': ast.fromId });
      toNode = await Row.findOne({ database: this.activeDb, table: ast.toTable, 'data.id': ast.toId });
    }

    if (!fromNode) throw new Error(`Record with ID ${ast.fromId} not found in table '${ast.fromTable}'`);
    if (!toNode) throw new Error(`Record with ID ${ast.toId} not found in table '${ast.toTable}'`);

    if (this.useInMemory) {
      global.inMemoryStore.relationships.push({
        database: this.activeDb,
        fromTable: ast.fromTable,
        fromId: ast.fromId,
        toTable: ast.toTable,
        toId: ast.toId,
        type: ast.label
      });
    } else {
      await new Relationship({
        database: this.activeDb,
        fromTable: ast.fromTable,
        fromId: ast.fromId,
        toTable: ast.toTable,
        toId: ast.toId,
        type: ast.label
      }).save();
    }

    return {
      message: `Graph link created: ${ast.fromTable}(${ast.fromId}) -> [${ast.label}] -> ${ast.toTable}(${ast.toId})`,
      columns: ['status', 'relation'],
      rows: [['Connected', `${ast.fromTable} ➜ [${ast.label}] ➜ ${ast.toTable}`]],
      rowsAffected: 1
    };
  }

  async executeGraphTraverse(ast) {
    if (!this.activeDb) throw new Error('Database not selected. Run USE <dbname> first.');

    let startNode = null;
    if (this.useInMemory) {
      startNode = global.inMemoryStore.rows.find(r => r.database === this.activeDb && r.table === ast.table && r.data.id == ast.id);
    } else {
      startNode = await Row.findOne({ database: this.activeDb, table: ast.table, 'data.id': ast.id });
    }

    if (!startNode) throw new Error(`Root record '${ast.table}(${ast.id})' not found`);

    const visitedNodes = [];
    const queue = [{ table: ast.table, id: ast.id, depth: 0, path: [`${ast.table}(${ast.id})`] }];
    const visitedSet = new Set([`${ast.table}:${ast.id}`]);
    const visualEdges = [];

    while (queue.length > 0) {
      const curr = queue.shift();
      
      let record = null;
      if (this.useInMemory) {
        record = global.inMemoryStore.rows.find(r => r.database === this.activeDb && r.table === curr.table && r.data.id == curr.id);
      } else {
        record = await Row.findOne({ database: this.activeDb, table: curr.table, 'data.id': curr.id });
      }

      if (record) {
        visitedNodes.push({
          node_ref: `${curr.table}(${curr.id})`,
          tableName: curr.table,
          id: curr.id,
          depth: curr.depth,
          path: curr.path.join(' ➜ '),
          data: record.data
        });
      }

      if (curr.depth < ast.depth) {
        let edges = [];
        if (this.useInMemory) {
          edges = global.inMemoryStore.relationships.filter(r => r.database === this.activeDb && r.fromTable === curr.table && r.fromId == curr.id);
        } else {
          edges = await Relationship.find({
            database: this.activeDb,
            fromTable: curr.table,
            fromId: curr.id
          });
        }

        for (const edge of edges) {
          const neighborKey = `${edge.toTable}:${edge.toId}`;
          visualEdges.push({
            from: `${edge.fromTable}(${edge.fromId})`,
            to: `${edge.toTable}(${edge.toId})`,
            label: edge.type
          });

          if (!visitedSet.has(neighborKey)) {
            visitedSet.add(neighborKey);
            queue.push({
              table: edge.toTable,
              id: edge.toId,
              depth: curr.depth + 1,
              path: [...curr.path, `[${edge.type}] ➜ ${edge.toTable}(${edge.toId})`]
            });
          }
        }
      }
    }

    const rows = visitedNodes.map(node => [
      node.node_ref,
      node.depth,
      node.path,
      JSON.stringify(node.data)
    ]);

    // Attach Graph Visualization Node-Link Network payload
    return {
      columns: ['node_ref', 'depth', 'traversal_path', 'document_properties'],
      rows,
      rowsAffected: rows.length,
      graphVisualizer: {
        nodes: visitedNodes.map(n => ({ id: n.node_ref, label: n.node_ref, table: n.tableName, doc: n.data })),
        edges: visualEdges
      }
    };
  }
}

// Handler wrapper to parse and execute
async function runQuery(queryString, activeDb = null, sessionId = 'default') {
  try {
    const lex = new Tokenizer(queryString);
    const tokens = lex.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const useInMemory = !mongoose.connection || mongoose.connection.readyState !== 1;
    const exec = new Executor(activeDb, useInMemory, sessionId);
    const res = await exec.execute(ast);
    const session = exec.getSession();
    return {
      success: true,
      ast,
      inTransaction: session ? session.inTransaction : false,
      ...res
    };
  } catch (err) {
    const inTx = global.dbSessions && global.dbSessions[sessionId] ? global.dbSessions[sessionId].inTransaction : false;
    return {
      success: false,
      inTransaction: inTx,
      error: err.message || 'Unknown syntax error',
      position: err.position !== undefined ? err.position : 0,
      line: err.line !== undefined ? err.line : 1,
      column: err.column !== undefined ? err.column : 1
    };
  }
}

module.exports = {
  Tokenizer,
  Parser,
  Executor,
  runQuery
};
