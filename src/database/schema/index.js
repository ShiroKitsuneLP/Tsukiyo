// Import necessary modules
const path = require('path');

// Import schema setup functions
const { setupSpotifySchema } = require(path.join(__dirname, './spotify'));
const { setupToggleSchema } = require(path.join(__dirname, './toggle'));

// Function to setup database schema
function setupSchema() {
    setupSpotifySchema();
    setupToggleSchema();
}

module.exports = { setupSchema }