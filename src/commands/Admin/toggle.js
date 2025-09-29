// Import necessary modules
const path = require('path');

// Import toggle repository
const { toggleRepo } = require(path.join(__dirname, './../../database/repo'));

// List of allowed features to toggle
const allowedFeatures = ['sr'];

module.exports = {
	name: 'toggle',
	description: 'Toggle a feature for this channel (admin only)',
	aliases: [],
	async execute(client, channel, userstate, args, message) {
		const channelName = channel.replace('#', '').toLowerCase();
		const userName = userstate['username'].toLowerCase();

		if (userName !== channelName) {
			client.say(channel, `@${userstate['display-name']} Only the channel owner can use this command.`);
			return;
		}

		if (!args.length) {
			client.say(channel, `@${userstate['display-name']} Usage: !toggle <feature> | Allowed: ${allowedFeatures.join(', ')}`);
			return;
		}

		const feature = args[0].toLowerCase();

		if (!allowedFeatures.includes(feature)) {
			client.say(channel, `@${userstate['display-name']} Unknown feature. Allowed: ${allowedFeatures.join(', ')}`);
			return;
		}
		// Get current state
		const current = toggleRepo.getToggle(channelName, feature);
		const newState = current ? 0 : 1;
		toggleRepo.setToggle(channelName, feature, newState);
		client.say(channel, `@${userstate['display-name']} Feature '${feature}' is now ${newState ? 'enabled' : 'disabled'} for this channel.`);
	}
};
