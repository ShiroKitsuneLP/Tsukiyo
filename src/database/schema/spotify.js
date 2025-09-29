// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

function setupSpotifySchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS spotify_accounts (
            channel TEXT PRIMARY KEY,
            access_token TEXT NOT NULL,
            refresh_token TEXT NOT NULL,
            token_expires_at DATETIME NOT NULL
        );
    `);
}

module.exports = { setupSpotifySchema }