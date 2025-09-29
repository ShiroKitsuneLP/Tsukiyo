// Import the tmi.js library
const { Client } = require('tmi.js');

// Import configuration
const config = require('./config/config.json');

// Create client instance
const tsukiyo = new Client({
    options: { 
        debug: config.features.debug,
        messagesLogLevel: "info"
    },
    connection: {
        reconnect: config.features.reconnect,
        secure: true
    },
    identity: {
        username: config.bot.username,
        password: config.bot.password
    },
    channels: config.channels
});

// Event handlers
tsukiyo.on('connected', (addr, port) => {
    console.log(`Tsukiyo connected on ${addr}:${port}`);
    console.log(`Channels: ${config.channels.join(', ')}`);
});

tsukiyo.on('message', (channel, userstate, message, self) => {
    if (self) return;
    console.log(`[${channel}] ${userstate['display-name']}: ${message}`);
});

// Connect to Twitch
tsukiyo.connect().catch(console.error);