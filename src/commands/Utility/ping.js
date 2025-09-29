module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    aliases: [],
    execute: (client, channel, userstate) => {
        client.say(channel, `@${userstate['display-name']} Pong! 🏓`);
    }
}