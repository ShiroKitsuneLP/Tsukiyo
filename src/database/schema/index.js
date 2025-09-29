// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupSpotifySchema } = require(path.join(__dirname, './spotify'));

// Function to setup database schema
function setupSchema() {
    setupSpotifySchema();
}

module.exports = { setupSchema }