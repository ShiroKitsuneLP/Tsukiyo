// Import necessary modules
const path = require('path');

// Import database repo
const { spotifyRepo, toggleRepo } = require(path.join(__dirname, './../../database/repo'));

// Import Spotify API library
const SpotifyWebApi = require('spotify-web-api-node');
const config = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
	name: 'skip',
	description: 'Skip the current Spotify song (Streamer/Mods only, SR muss aktiviert sein)',
	aliases: [],
	async execute(client, channel, userstate, args, message) {
		const channelName = channel.replace('#', '').toLowerCase();
		const userName = userstate['username'].toLowerCase();

		// Only streamer or mod can skip
		const isMod = userstate.mod || userstate['user-type'] === 'mod' || userName === channelName;
		if (!isMod) {
			client.say(channel, `@${userstate['display-name']} Only the channel owner or a mod can use this command.`);
			return;
		}

		// Check if SR is enabled
		const srToggle = toggleRepo.getToggle(channelName, 'sr');
		if (!srToggle) {
			client.say(channel, `@${userstate['display-name']} Song requests are currently disabled in this channel.`);
			return;
		}

		// Check if Spotify is linked
		const account = spotifyRepo.getSpotifyAccount(channelName);
		if (!account || !account.access_token) {
			client.say(channel, `@${userstate['display-name']} No Spotify account linked for this channel. Ask the channel owner to use !spotify connect`);
			return;
		}

		// Prepare Spotify API
		const spotifyApi = new SpotifyWebApi({
			clientId: config.spotify.client_id,
			clientSecret: config.spotify.client_secret,
			redirectUri: config.spotify.redirect_uri
		});
		spotifyApi.setAccessToken(account.access_token);
		spotifyApi.setRefreshToken(account.refresh_token);

		// Token refresh if needed
		async function ensureValidToken() {
			const expiresAt = new Date(account.token_expires_at).getTime();
			if (Date.now() > expiresAt - 60 * 1000) {
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

		if (!(await ensureValidToken())) return;

		// Song skippen
		try {
			await spotifyApi.skipToNext();
			client.say(channel, `@${userstate['display-name']} Skipped to next song!`);
		} catch (error) {
			console.error('[SR] Spotify skip error:', error);
			if (error && error.body && error.body.error && error.body.error.reason === 'NO_ACTIVE_DEVICE') {
				client.say(channel, `@${userstate['display-name']} No active Spotify device found. Please open Spotify and start playback on any device (PC, Web, Handy).`);
			} else {
				client.say(channel, `@${userstate['display-name']} Error skipping song.`);
			}
		}
	}
}
