// Import necessary modules
const path = require('path');

// Import Spotify repo
const { spotifyRepo } = require(path.join(__dirname, './../../database/repo'));

// Import config
const config = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
	name: 'spotify',
	description: 'Spotify Account mit dem Bot verbinden (nur Channel-Inhaber)',
	aliases: [],
	async execute(client, channel, userstate, args, message) {

		// Check if user is the channel owner
		const channelName = channel.replace('#', '').toLowerCase();
		const userName = userstate['username'].toLowerCase();

		if (userName !== channelName) {
			client.say(channel, `@${userstate['display-name']} Only the channel owner can use this command.`);
			return;
		}

		// Show help if no arguments
		if (!args.length) {
			client.say(channel, `@${userstate['display-name']} Spotify Help Commands: !spotify connect – Link your account | !spotify status – Show connection status | !spotify revoke – Unlink your account`);
			return;
		}

		// Subcommand: connect
		if (args[0] === 'connect') {
			const clientId = config.spotify.client_id;
			const redirectUri = config.spotify.redirect_uri;

			const scopes = [
				'user-modify-playback-state',
				'user-read-playback-state',
				'user-read-currently-playing',
				'user-read-private',
				'user-read-email'
			];
			const state = `${channelName}-${Date.now()}`;
			const authUrl =
				`https://accounts.spotify.com/authorize?` +
				`client_id=${encodeURIComponent(clientId)}` +
				`&response_type=code` +
				`&redirect_uri=${encodeURIComponent(redirectUri)}` +
				`&scope=${encodeURIComponent(scopes.join(' '))}` +
				`&state=${encodeURIComponent(state)}`;
			client.say(channel, `@${userstate['display-name']} Connect your Spotify account: ${authUrl}`);
			return;
		}

		// Subcommand: status
		if (args[0] === 'status') {
			// Check if a Spotify account is linked for this channel
			const account = spotifyRepo.getSpotifyAccount(channelName);
			if (account && account.access_token) {
				client.say(channel, `@${userstate['display-name']} Spotify is linked for this channel.`);
			} else {
				client.say(channel, `@${userstate['display-name']} No Spotify account is linked for this channel.`);
			}
			return;
		}

		// Subcommand: revoke
		if (args[0] === 'revoke') {
			spotifyRepo.deleteSpotifyAccount(channelName);
			client.say(channel, `@${userstate['display-name']} Your Spotify account has been unlinked.`);
			return;
		}
	}
}