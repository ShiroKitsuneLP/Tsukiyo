// Import necessary modules
const path = require('path');


// Import database Repos
const { toggleRepo, spotifyRepo } = require(path.join(__dirname, './../../database/repo'));

// Import Spotify API
const SpotifyWebApi = require('spotify-web-api-node');
const config = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
    name: 'songrequest',
    description: 'Request a song to be played (SR must be enabled by the channel owner)',
    aliases: ['sr'],
    async execute(client, channel, userstate, args, message) {      
        const channelName = channel.replace('#', '').toLowerCase();
        const userName = userstate['username'].toLowerCase();

        // Check if SR is enabled for this channel
        const srToggle = toggleRepo.getToggle(channelName, 'sr');

        if (!srToggle) {
            client.say(channel, `@${userstate['display-name']} Song requests are currently disabled in this channel.`);
            return;
        }

        // Check for query
        if (!args.length) {
            client.say(channel, `@${userstate['display-name']} Usage: !sr <song/artist>`);
            return;
        }

        // Check if Spotify is linked for this channel
        const account = spotifyRepo.getSpotifyAccount(channelName);
        if (!account || !account.access_token) {
            client.say(channel, `@${userstate['display-name']} No Spotify account linked for this channel. Ask the channel owner to use !spotify connect`);
            return;
        }

        // Prepare Spotify API instance
        const spotifyApi = new SpotifyWebApi({
            clientId: config.spotify.client_id,
            clientSecret: config.spotify.client_secret,
            redirectUri: config.spotify.redirect_uri
        });

        spotifyApi.setAccessToken(account.access_token);
        spotifyApi.setRefreshToken(account.refresh_token);

        // Helper: Refresh token if needed
        async function ensureValidToken() {
            const expiresAt = new Date(account.token_expires_at).getTime();
            if (Date.now() > expiresAt - 60 * 1000) { // refresh 1min before expiry
                try {
                    const data = await spotifyApi.refreshAccessToken();
                    const newToken = data.body['access_token'];
                    const expiresIn = data.body['expires_in'];
                    const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
                    spotifyRepo.setSpotifyAccount(channelName, newToken, account.refresh_token, newExpiresAt);
                    spotifyApi.setAccessToken(newToken);
                } catch (err) {
                    client.say(channel, `@${userstate['display-name']} Error refreshing Spotify token. Ask the channel owner to reconnect.`);
                    return false;
                }
            }
            return true;
        }

        // Main logic
        if (!(await ensureValidToken())) return;

        const query = args.join(' ');

        // Helper: Extract Spotify URI from link
        function extractSpotifyUri(text) {
            // Matches open.spotify.com/(intl-xx/)?track|album|playlist/xxx or spotify:track:xxx etc.
            const urlMatch = text.match(/open\.spotify\.com\/(?:[a-zA-Z0-9-]+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/);
            if (urlMatch) {
                return `spotify:${urlMatch[1]}:${urlMatch[2]}`;
            }
            const uriMatch = text.match(/spotify:(track|album|playlist):([a-zA-Z0-9]+)/);
            if (uriMatch) {
                return uriMatch[0];
            }
            return null;
        }

        const spotifyUri = extractSpotifyUri(query);
        try {
            if (spotifyUri) {
                await spotifyApi.addToQueue(spotifyUri);
                client.say(channel, `@${userstate['display-name']} Added to queue: ${spotifyUri}`);
            } else {
                const search = await spotifyApi.searchTracks(query, { limit: 1 });
                if (!search.body.tracks.items.length) {
                    client.say(channel, `@${userstate['display-name']} No results found for "${query}".`);
                    return;
                }
                const track = search.body.tracks.items[0];
                await spotifyApi.addToQueue(track.uri);
                client.say(channel, `@${userstate['display-name']} Added to queue: ${track.name} by ${track.artists.map(a => a.name).join(', ')}`);
            }
        } catch (error) {
            console.error('[SR] Spotify error:', error);
            if (error && error.body && error.body.error && error.body.error.reason === 'NO_ACTIVE_DEVICE') {
                client.say(channel, `@${userstate['display-name']} No active Spotify device found. Please open Spotify and start playback on any device (PC, Web, Handy).`);
            } else {
                client.say(channel, `@${userstate['display-name']} Error adding song to queue.`);
            }
        }
    }
}
