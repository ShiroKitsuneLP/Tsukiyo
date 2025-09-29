module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    aliases: [],
    execute: (client, channel, userstate, args, message) => {
        client.say(channel, `@${userstate['display-name']} Pong! 🏓`);
    }
}