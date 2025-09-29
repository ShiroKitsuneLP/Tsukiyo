// Spotify OAuth callback route handler
const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config/config.json');
const { spotifyRepo } = require('../database/repo');

// GET /callback
router.get('/', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    if (!code || !state) {
        return res.status(400).send('Missing code or state.');
    }

    // Extract channel from state (format: channelname-timestamp)
    const channel = state.split('-')[0];

    const spotifyApi = new SpotifyWebApi({
        clientId: config.spotify.client_id,
        clientSecret: config.spotify.client_secret,
        redirectUri: config.spotify.redirect_uri
    });

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
        const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

        // Save tokens for the channel
        spotifyRepo.setSpotifyAccount(channel, access_token, refresh_token, token_expires_at);

        const spotifyAccount = spotifyRepo.getSpotifyAccount(channel); // For debugging

        console.log(`Spotify account for channel ${channel}:`, spotifyAccount);

        res.send('Spotify account successfully linked! You can close this window.');
    } catch (err) {
        console.error('[Spotify Callback] Error exchanging code:', err);
        res.status(500).send('Error linking Spotify account.');
    }
});

module.exports = router;
