import Command, { CommandExecutor } from '../Command'
import config from '../../util/config'
import fs from 'fs'
import { arrayToChunks, entries } from '../../util/utilities'

const configuration = {
    name: 'topmokaajat',
    admin: true,
    syntax: 'topmokaajat',
    desc: 'Myötistä myö',
    triggers: ['mokaajat'],
    type: ['työkalut'],
    requireGuild: false
}

type UserFails = [id: string, amount: number]

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        let failLocation = config.COUNTING_GAME.FAILURE_LOCATION

        if (!fs.existsSync(failLocation)) return message.channel.send('ei ollenkaan tallennettuja mokia')

        const sortFailsFunction = (a: UserFails, b: UserFails) => {
            if (a[1] > b[1]) {
                return -1
            } else if (a[1] < b[1]) {
                return 1
            } else {
                return 0
            }
        }

        const embed = Command.createEmbed()
        const failData = entries(JSON.parse(fs.readFileSync(failLocation, 'utf-8')))
        const sortedFails = failData.sort(sortFailsFunction)
        const sortedFailChunks = arrayToChunks(sortedFails, 8)

        const pageCount = sortedFailChunks.length
        let pageNumber = parseInt(args[1]) || 1

        pageNumber = pageNumber - 1

        if (pageNumber < 0) pageNumber = 0
        else if (pageNumber > pageCount - 1) pageNumber = pageNumber - 1

        embed.setTitle('pahimmat mokaajat, nasty')
        embed.setFooter(`Sivu ${pageNumber + 1} / ${pageCount}`)

        const promises = sortedFailChunks[pageNumber].map(async (data) => {
            const user = await client.users.fetch(data[0])
            embed.addField(`${user.username || data[0]}:`, `${data[1]} läsähdystä`)
        })

        await Promise.all(promises)

        message.channel.send(embed)
        return resolve()
    })
}

export default new Command({
    configuration,
    executor
})
