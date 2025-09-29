// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

function setupToggleSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS toggles (
            channel TEXT NOT NULL,
            feature TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (channel, feature)
        );
    `);
}

module.exports = { setupToggleSchema }