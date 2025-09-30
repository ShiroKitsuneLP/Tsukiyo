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

// Start HTTP/HTTPS server
const https = require('https');
const http = require('http');

// Certificates for HTTPS
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, './cert/privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, './cert/fullchain.pem'))
};

const HTTPS_PORT = 3000;
const HTTP_PORT = 3080;

if (config.https) {
    https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
        console.log(`[Web] HTTPS server is listening on port ${HTTPS_PORT}`);
    });
}

// HTTP redirect to HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers.host.replace(/:.*/, ':' + HTTPS_PORT)}${req.url}` });
    res.end();
}).listen(HTTP_PORT, () => {
    console.log(`[Web] HTTP redirect server is listening on port ${HTTP_PORT}`);
});
