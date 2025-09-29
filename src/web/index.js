// Main entry point for all web endpoints
const express = require('express');
const app = express();

// Import necessary modules
const path = require('path');
const fs = require('fs');

// Import config for port and redirect_uri
const config = require(path.join(__dirname, './../config/config.json'));

// Import and register all web routes here
const spotifyCallback = require('./spotifyCallback');
app.use('/callback', spotifyCallback);

const PORT = config.webPort || 3000;

// Start HTTP server only (no HTTPS)
app.listen(PORT, () => {
    console.log(`[Web] HTTP server is listening on port ${PORT}`);
});
