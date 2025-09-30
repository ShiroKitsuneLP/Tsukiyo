// Import necessary modules
const path = require('path');

// Import database repo
const { spotifyRepo, toggleRepo } = require(path.join(__dirname, './../../database/repo'));

// Import config for Spotify API
const config = require(path.join(__dirname, './../../config/config.json'));
const axios = require('axios');

module.exports = {
    name: 'queue',
    description: 'Show the next songs in the Spotify queue (SR muss aktiviert sein)',
    aliases: ['playlist'],
    async execute(client, channel, userstate, args, message) {
        const channelName = channel.replace('#', '').toLowerCase();

        // Check if SR is enabled
        const srToggle = toggleRepo.getToggle(channelName, 'sr');

        if (!srToggle) {
            client.say(channel, `@${userstate['display-name']} Song requests are currently disabled in this channel.`);
            return;
        }

        // Temporarily disable due to Spotify API limitations
        const currentlyDisabled = true;
        
        if (currentlyDisabled) {
            client.say(channel, `@${userstate['display-name']} The !queue command is currently disabled due to Spotify API limitations. Please use the Spotify app or Webplayer to view your queue.`);
            return;
        }

        // Check if Spotify is linked
        const account = spotifyRepo.getSpotifyAccount(channelName);

        if (!account || !account.access_token) {
            client.say(channel, `@${userstate['display-name']} No Spotify account linked for this channel. Ask the channel owner to use !spotify connect`);
            return;
        }

        // Token refresh if needed
        async function ensureValidToken() {
            const expiresAt = new Date(account.token_expires_at).getTime();

            if (Date.now() > expiresAt - 60 * 1000) {

                // Get new token via SpotifyWebApi, as axios cannot refresh
                const SpotifyWebApi = require('spotify-web-api-node');
                const spotifyApi = new SpotifyWebApi({
                    clientId: config.spotify.client_id,
                    clientSecret: config.spotify.client_secret,
                    redirectUri: config.spotify.redirect_uri
                });

                spotifyApi.setAccessToken(account.access_token);
                spotifyApi.setRefreshToken(account.refresh_token);

                try {
                    const data = await spotifyApi.refreshAccessToken();
                    const newToken = data.body['access_token'];
                    const expiresIn = data.body['expires_in'];
                    const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
                    spotifyRepo.setSpotifyAccount(channelName, newToken, account.refresh_token, newExpiresAt);
                    return newToken;
                } catch (err) {
                    client.say(channel, `@${userstate['display-name']} Error refreshing Spotify token. Ask the channel owner to reconnect.`);
                    return null;
                }
            }
            return account.access_token;
        }

        const accessToken = await ensureValidToken();
        if (!accessToken) return;

        // Get queue via HTTP request
        try {
            const response = await axios.get('https://api.spotify.com/v1/me/queue', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const queue = response.data.queue;

            if (!queue || !queue.length) {
                client.say(channel, `@${userstate['display-name']} The Spotify queue is empty.`);
                return;
            }

            // Show the next 3 songs
            const nextSongs = queue.slice(0, 3).map(track => `${track.name} by ${track.artists.map(a => a.name).join(', ')}`).join(' | ');
            client.say(channel, `@${userstate['display-name']} Next in queue: ${nextSongs}`);
        } catch (error) {
            console.error('[SR] Spotify queue error:', error && error.response ? error.response.data : error);

            if (error && error.response && error.response.data && error.response.data.error && error.response.data.error.reason === 'NO_ACTIVE_DEVICE') {
                client.say(channel, `@${userstate['display-name']} No active Spotify device found. Please open Spotify and start playback on any device (PC, Web, Handy).`);
            } else {
                client.say(channel, `@${userstate['display-name']} Error fetching queue.`);
            }
        }
    }
}
