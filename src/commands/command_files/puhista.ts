import Discord from 'discord.js'
import Command, { CommandExecutor } from '../Command'

const configuration = {
    name: 'puhista',
    admin: true,
    syntax: 'puhista <määrä 1-99>',
    desc: 'poistaa kanavalta x määrän viestejä',
    triggers: ['puhista'],
    type: ['työkalut'],
    requireGuild: true
}

const executor: CommandExecutor = (message, client, _args) => {
    return new Promise(async (resolve, reject) => {
        let args: Array<number> = _args.map((a) => Number(a))
        if (args[1] >= 2 && args[1] <= 99) {
            let embed = Command.createEmbed()
            let channel = message.channel as Discord.TextChannel
            embed.setDescription(`Poistin ${args[1]} viestiä.`)
            let amount = args[1] + 1
            await channel.bulkDelete(amount)
            message.channel
                .send(embed)
                .then((message) => message.delete({ timeout: 4000 }))
                .catch((err) => console.info(err))
        } else {
            let embed = Command.syntaxEmbed({ configuration })
            message.channel.send(embed).catch((err) => console.info(err))
        }
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
