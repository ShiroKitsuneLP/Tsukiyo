// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, '../db'));

// Prepare Statements
const setSpotifyAccountStmt = db.prepare(`
    INSERT INTO spotify_accounts (channel, access_token, refresh_token, token_expires_at)
    VALUES (@channel, @access_token, @refresh_token, @token_expires_at)
    ON CONFLICT(channel) DO UPDATE SET
        access_token=excluded.access_token,
        refresh_token=excluded.refresh_token,
        token_expires_at=excluded.token_expires_at
`);

const getSpotifyAccountStmt = db.prepare('SELECT * FROM spotify_accounts WHERE channel = @channel');

const deleteSpotifyAccountStmt = db.prepare('DELETE FROM spotify_accounts WHERE channel = @channel');

// Function to set or update Spotify account for a channel
function setSpotifyAccount(channel, access_token, refresh_token, token_expires_at) {
    setSpotifyAccountStmt.run({ channel, access_token, refresh_token, token_expires_at });
}

// Get Spotify account for a channel
function getSpotifyAccount(channel) {
	return getSpotifyAccountStmt.get({ channel });
}

// Delete Spotify account for a channel
function deleteSpotifyAccount(channel) {
    deleteSpotifyAccountStmt.run({ channel });
}

module.exports = {
	getSpotifyAccount,
	setSpotifyAccount,
	deleteSpotifyAccount
}
