const configuration = require('../configuration.json')

let { commands, triggers } = require('../commands/loader.js').loaded();

let prefix = configuration.DISCORD.PREFIX


module.exports = {
    parse: function (message, client) {
        let hasPrefix = message.content.startsWith(prefix)

        if (!hasPrefix && message.content.includes('bad bot')) {
            message.channel.send('no u')
            return
        }

        if (!hasPrefix && message.content.includes('good bot')) {
            message.channel.send('ty')
            return
        }

        if (!hasPrefix) return;

        let args = message.content.trim().substr(prefix.length).split(' ')

        let trigger = args[0].toLowerCase()

        if (!triggers.hasOwnProperty(trigger)) return;

        let command = commands.get(triggers[trigger])

        command.execute(message, client, args)

    }
} 