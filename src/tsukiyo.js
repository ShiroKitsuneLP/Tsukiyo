// Import the tmi.js library
const { Client } = require('tmi.js');

// Import nessesary modules
const path = require('path');

// Import configuration
const config = require(path.join(__dirname, './config/config.json'));

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

// Import command loader
const { commandLoader } = require(path.join(__dirname, './utils/loader.js'));

// Initialize commands map
const commands = new Map();
commandLoader(commands, path.join(__dirname, 'commands'));

// Load commands

// Event handlers
tsukiyo.on('connected', (addr, port) => {
    console.log(`Tsukiyo connected on ${addr}:${port}`);
    console.log(`Channels: ${config.channels.join(', ')}`);
});

// Message handler
tsukiyo.on('message', (channel, userstate, message, self) => {
    if (self) return;

    if(message.startsWith(config.prefix)) {
        const args = message.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = commands.get(commandName);

        if(command) {
            try {
                command.execute(tsukiyo, channel, userstate, args, message);
            } catch (error) {
                console.error(`Error in command ${commandName}:`, error);
            }
        }
    }
});

// Connect to Twitch
tsukiyo.connect().catch(console.error);