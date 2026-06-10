const mongoose = require('mongoose');

const DatabaseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const TableSchema = new mongoose.Schema({
  database: { type: String, required: true },
  name: { type: String, required: true },
  columns: { type: [String], default: [] },
  columnDefinitions: { type: mongoose.Schema.Types.Mixed, default: [] }, // Array of { name, type, isPrimaryKey, isNotNull, isUnique }
  indexes: { type: [String], default: [] }
});
TableSchema.index({ database: 1, name: 1 }, { unique: true });

const RowSchema = new mongoose.Schema({
  database: { type: String, required: true },
  table: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
});
RowSchema.index({ database: 1, table: 1 });

const RelationshipSchema = new mongoose.Schema({
  database: { type: String, required: true },
  fromTable: { type: String, required: true },
  fromId: { type: mongoose.Schema.Types.Mixed, required: true },
  toTable: { type: String, required: true },
  toId: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, required: true }
});
RelationshipSchema.index({ database: 1, fromTable: 1, fromId: 1 });

const HistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  executionTimeMs: { type: Number, required: true },
  success: { type: Boolean, required: true },
  error: { type: String, default: null }
});

const Database = mongoose.model('Database', DatabaseSchema);
const Table = mongoose.model('Table', TableSchema);
const Row = mongoose.model('Row', RowSchema);
const Relationship = mongoose.model('Relationship', RelationshipSchema);
const History = mongoose.model('History', HistorySchema);

module.exports = {
  Database,
  Table,
  Row,
  Relationship,
  History
};
