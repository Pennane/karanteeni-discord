import Command, { CommandExecutor } from '../Command'
import config from '../../util/config'
import fs from 'fs'

const configuration = {
    name: 'tallennamokat',
    admin: true,
    syntax: 'tallennamokat <pelaaja_id> <määrä>',
    desc: 'aseta tallennettujen mokien määrä',
    triggers: ['tallennamokat'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        let failLocation = config.COUNTING_GAME.FAILURE_LOCATION

        if (!fs.existsSync(failLocation)) return message.channel.send('syystä x yks tiedosto puuttuu, ja tää ei siks toimi')

        if (args.length < 3) return message.channel.send('/tallennamokat pelaaja_id mokie_määrä')

        if (isNaN(parseInt(args[2]))) return message.channel.send('mokien määrä numerona, kiitos')

        const id = args[1]
        const fails = parseInt(args[2])
        const embed = Command.createEmbed()
        let failData = JSON.parse(fs.readFileSync(failLocation, 'utf-8'))
        failData[id] = fails
        fs.writeFileSync(failLocation, JSON.stringify(failData))
        embed.setTitle('Tallennetut mokat').setDescription(`Tallennettu uusi mokien määrä.`)
        message.channel.send(embed)
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
