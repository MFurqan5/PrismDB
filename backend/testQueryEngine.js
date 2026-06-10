const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { runQuery } = require('./queryEngine');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prismdb_test';

async function runTests() {
  console.log('--- STARTING SENTINELDB QUERY ENGINE TESTS ---');
  console.log(`Connecting to: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Helper to print query and output
    const execAndPrint = async (query, activeDb = null) => {
      console.log(`\nExecuting Query: "${query}" (Active DB: ${activeDb})`);
      const res = await runQuery(query, activeDb);
      if (res.success) {
        console.log('Result: SUCCESS');
        if (res.message) console.log(`Message: ${res.message}`);
        if (res.columns) console.log(`Columns: [${res.columns.join(', ')}]`);
        if (res.rows) console.log(`Rows count: ${res.rows.length}`);
        return res;
      } else {
        console.error(`Result: ERROR - ${res.error} at line ${res.line}, col ${res.column}`);
        return res;
      }
    };

    // 1. DDL: Create database
    await execAndPrint('CREATE DATABASE mytestdb;');
    
    // 2. Use Database
    const useRes = await execAndPrint('USE mytestdb;');
    let currentDb = useRes.activeDatabase || 'mytestdb';

    // 3. DDL: Create Table
    await execAndPrint('CREATE TABLE members (id, name, email, age, role);', currentDb);

    // 4. DML: Inserts
    await execAndPrint('INSERT INTO members VALUES (1, "Alice Smith", "alice@test.com", 23, "developer");', currentDb);
    await execAndPrint('INSERT INTO members (id, name, email, age, role) VALUES (2, "Bob Miller", "bob@test.com", 35, "admin");', currentDb);
    await execAndPrint('INSERT INTO members (name, email) VALUES ("Jane Doe", "jane@test.com");', currentDb);

    // 5. DQL: Select Queries
    await execAndPrint('SELECT * FROM members;', currentDb);
    await execAndPrint('SELECT name, role FROM members WHERE age > 25;', currentDb);
    await execAndPrint('SELECT name, email FROM members WHERE name LIKE "%Alice%";', currentDb);

    // 6. DQL: Aggregations & Grouping
    await execAndPrint('SELECT COUNT(*) FROM members;', currentDb);
    await execAndPrint('SELECT role, COUNT(*) FROM members GROUP BY role;', currentDb);

    // 7. NoSQL extensions
    // Indexing
    await execAndPrint('INDEX CREATE ON members(email);', currentDb);

    // Document Finder
    await execAndPrint('FIND IN members WHERE email = "bob@test.com";', currentDb);

    // 8. DML: Updates & Deletes
    await execAndPrint('UPDATE members SET age = 36 WHERE name = "Bob Miller";', currentDb);
    await execAndPrint('SELECT * FROM members WHERE name = "Bob Miller";', currentDb);
    await execAndPrint('DELETE FROM members WHERE id = 1;', currentDb);
    await execAndPrint('SELECT * FROM members;', currentDb);

    // 9. DDL: Drop Table and Database
    await execAndPrint('DROP TABLE members;', currentDb);
    await execAndPrint('DROP DATABASE mytestdb;', currentDb);

    console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\nTest execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTests();
