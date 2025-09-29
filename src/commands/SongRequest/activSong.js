// Import necessary modules
const path = require('path');
const { spotifyRepo, toggleRepo } = require(path.join(__dirname, './../../database/repo'));
const SpotifyWebApi = require('spotify-web-api-node');
const config = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
	name: 'activsong',
	description: 'Show the currently playing Spotify song (SR muss aktiviert sein)',
	aliases: ['current', 'nowplaying'],
	async execute(client, channel, userstate, args, message) {
		const channelName = channel.replace('#', '').toLowerCase();

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

		// Get current song
		try {
			const playback = await spotifyApi.getMyCurrentPlaybackState();
			if (!playback.body || !playback.body.is_playing || !playback.body.item) {
				client.say(channel, `@${userstate['display-name']} No song is currently playing on Spotify.`);
				return;
			}
			const track = playback.body.item;
			const artists = track.artists.map(a => a.name).join(', ');
			const url = track.external_urls && track.external_urls.spotify ? track.external_urls.spotify : '';
			client.say(channel, `@${userstate['display-name']} Now playing: ${track.name} by ${artists}${url ? ' | ' + url : ''}`);
		} catch (error) {
			console.error('[SR] Spotify nowplaying error:', error);
			if (error && error.body && error.body.error && error.body.error.reason === 'NO_ACTIVE_DEVICE') {
				client.say(channel, `@${userstate['display-name']} No active Spotify device found. Please open Spotify and start playback on any device (PC, Web, Handy).`);
			} else {
				client.say(channel, `@${userstate['display-name']} Error fetching current song.`);
			}
		}
	}
}
