// Import necessary modules
const path = require('path');

// Export all database repo modules
module.exports = {
    spotifyRepo: require(path.join(__dirname, './spotify')),
}