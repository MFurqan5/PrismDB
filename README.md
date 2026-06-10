# PrismDB - Cyberpunk ADBMS Workbench

PrismDB is a production-quality cybersecurity database workbench. It features a custom SQL compiler (Lexer, Parser, and AST Executor) running on a Node.js/Express backend, which compiles SQL queries and performs operations on MongoDB Atlas or a local in-memory sandbox. The UI is a dark cyberpunk React-based IDE.

---

## Getting Started

### 1. Prerequisites
Ensure you have Node.js installed on your machine.

### 2. Configure Environment Variables
Create a `.env` file inside the `backend` folder with the following contents:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/prismdb
```
*(If `MONGODB_URI` is omitted, the engine will automatically start in **Sandbox Fallback Mode** using an in-memory database store).*

### 3. Launching the Application

* **Start the Backend API Server**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
  The backend will listen on `http://localhost:5000`.

* **Start the Frontend Vite Client**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  Open `http://localhost:3000` in your web browser.

---

## Supported Query Keywords & Syntax

The PrismDB custom SQL compiler recognizes and parses the following keywords, operators, and query structures:

### 1. Keywords & Dictionary
* **Query Commands**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP`, `SHOW`, `USE`, `DESCRIBE`, `RENAME`, `FIND`, `INDEX`, `GRAPH`
* **Query Modifiers & Operators**: `FROM`, `WHERE`, `JOIN`, `ON`, `INNER`, `LEFT`, `RIGHT`, `ORDER`, `BY`, `LIMIT`, `OFFSET`, `UNION`, `INTERSECT`, `AS`, `TRAVERSE`, `DEPTH`, `AND`, `OR`, `LIKE`, `SET`, `INTO`, `VALUES`, `DATABASES`, `TABLES`, `DATABASE`, `TABLE`
* **Transactions**: `BEGIN`, `TRANSACTION`, `COMMIT`, `ROLLBACK`
* **Column Constraints**: `PRIMARY KEY`, `NOT NULL`, `UNIQUE`
* **Aggregate Functions**: `COUNT`, `AVG`, `MIN`, `MAX`, `SUM`
* **Boolean & Omitted Literals**: `TRUE`, `FALSE`, `NULL`
* **Operators**:
  * Mathematical Comparisons: `=`, `!=`, `<>`, `>`, `<`, `>=`, `<=`
  * Search Comparisons: `LIKE`, `CONTAINS`, `IN`
  * Graph Linker Arrow: `->`

---

## Detailed Syntax Reference & Query Examples

### 1. DDL Queries (Data Definition Language)

#### CREATE DATABASE
Creates a new database namespace.
```sql
CREATE DATABASE database_name;
```

#### USE
Switches the active database connection context.
```sql
USE database_name;
```

#### CREATE TABLE
Creates a table schema. Supports type coercion (`INT`, `INTEGER`, `VARCHAR`, `TEXT`, `BOOLEAN`, `DECIMAL`, `DOUBLE`, `FLOAT`) and constraints (`PRIMARY KEY`, `NOT NULL`, `UNIQUE`).
```sql
CREATE TABLE table_name (
  column_1 INT PRIMARY KEY,
  column_2 VARCHAR NOT NULL,
  column_3 BOOLEAN,
  column_4 VARCHAR UNIQUE
);
```

#### SHOW
Lists databases or tables in the active context.
```sql
SHOW DATABASES;
SHOW TABLES;
```

#### DESCRIBE
Inspects column definitions, type metadata, constraints, and indexes.
```sql
DESCRIBE table_name;
```

#### RENAME TABLE
Renames an existing table.
```sql
RENAME TABLE old_table_name TO new_table_name;
```

#### DROP
Deletes a table or database and purges all records.
```sql
DROP TABLE table_name;
DROP DATABASE database_name;
```

---

### 2. DML Queries (Data Manipulation Language)

#### INSERT INTO
Inserts records into tables. Omitted columns default to `NULL` (unless violated by a `NOT NULL` constraint). Missing primary key `id` columns automatically auto-increment.
* **Standard Insert (Values only)**:
  ```sql
  INSERT INTO table_name VALUES (1, "Alice Smith", true, "alice@sentinel.org");
  ```
* **Columned Insert**:
  ```sql
  INSERT INTO table_name (id, name, active, email) VALUES (2, "Bob Miller", false, "bob@sentinel.org");
  ```

#### UPDATE
Modifies existing records. Constraints are evaluated only on the columns modified in the `SET` block.
```sql
UPDATE table_name SET active = true, email = "new_bob@sentinel.org" WHERE name = "Bob Miller";
```

#### DELETE
Removes records matching a condition.
```sql
DELETE FROM table_name WHERE id = 1;
```

---

### 3. DQL Queries (Data Querying Language)

#### SELECT
Retrieves records. Supports projection, table aliases, filters, grouping, ordering, limits, and joins.
* **Standard Projection**:
  ```sql
  SELECT * FROM table_name;
  SELECT column_1, column_2 AS alias_name FROM table_name;
  ```
* **Filter Evaluation**:
  ```sql
  SELECT * FROM table_name WHERE active = true AND (column_1 > 10 OR column_2 LIKE "%Alice%");
  ```
* **Joins (INNER, LEFT, and RIGHT joins supported)**:
  ```sql
  SELECT users.name, scans.result 
  FROM users 
  INNER JOIN scans ON users.id = scans.user_id;
  ```
* **Aggregations & Grouping**:
  ```sql
  SELECT COUNT(*) FROM table_name;
  SELECT active, COUNT(*), AVG(column_1) FROM table_name GROUP BY active;
  ```
* **Ordering and Pagination**:
  ```sql
  SELECT * FROM table_name ORDER BY column_1 DESC LIMIT 5 OFFSET 0;
  ```
* **Set Operations**:
  ```sql
  SELECT column_1 FROM table_1 UNION SELECT column_1 FROM table_2;
  SELECT column_1 FROM table_1 INTERSECT SELECT column_1 FROM table_2;
  ```

---

### 4. Transactions (ACID isolation)
Stages modifications inside a tab-isolated Sandbox memory session buffer. Safe from concurrent connections until committed.
```sql
-- Start session-isolated transaction (Renders a blinking gold badge in the editor)
BEGIN TRANSACTION;

-- Stage writes
INSERT INTO table_name (id, name, active) VALUES (5, "Staged Record", true);
UPDATE table_name SET active = false WHERE id = 2;

-- Read uncommitted staged view
SELECT * FROM table_name;

-- Save atomically to the database
COMMIT;

-- Or roll back changes
ROLLBACK;
```

---

### 5. Document & NoSQL Queries
Look up nested keys inside structured objects and optimize lookups with indexing.
```sql
-- Create an index
INDEX CREATE ON table_name(email);

-- Query nested keys in document fields
FIND IN table_name WHERE email = "bob@sentinel.org";
```

---

### 6. Graph Relationships & BFS Traversals
Link records together and traverse relationship nodes inside the interactive SVG spring-force graph.

#### GRAPH LINK
Creates a relationship reference from a source record to a target record.
```sql
GRAPH LINK table_1(id_1) -> table_2(id_2) AS "relation_label";
```

#### GRAPH TRAVERSE
Performs a Breadth-First Search (BFS) starting from a specific node up to the specified depth.
```sql
GRAPH TRAVERSE FROM table_1(id_1) DEPTH 3;
```
*(Running a traversal query automatically activates the **GRAPH VISUALIZER** panel in the bottom tab pane, rendering nodes and links with hover tooltip support).*
