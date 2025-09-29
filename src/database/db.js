// Import the better-sqlite3 library for database operations
const Database = require('better-sqlite3');

// Import nessesary modules
const path = require('path');
const fs = require('fs');

// Define the database directory path
const dataDir = path.join(__dirname, './../data');

// Check if the data directory exists, if not, create it
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Define the database file path
const dbPath = path.join(dataDir, 'tsukiyo.db');

// Check if the database file exists, if not, create it
if (fs.existsSync(dbPath)) {
    console.log(`[Database] Database file found at ${dbPath}`);
} else {
    console.log(`[Database] Database file not found. Creating new database at ${dbPath}`);
}

// Initialize the database connection
const db = new Database(dbPath);

db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging
db.pragma('synchronous = NORMAL'); // Set synchronous mode to NORMAL
db.pragma('foreign_keys = ON'); // Enable foreign key constraints

module.exports = { db }