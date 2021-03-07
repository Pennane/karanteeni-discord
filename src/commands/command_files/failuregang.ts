import Command, { CommandExecutor } from '../Command'
import config from '../../util/config'
import fs from 'fs'

const configuration = {
    name: 'topmokaajat',
    admin: true,
    syntax: 'topmokaajat',
    desc: 'Myötistä myö',
    triggers: ['mokaajat'],
    type: ['työkalut'],
    requireGuild: false
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]]
}[keyof T][]

function entries<T>(obj: T): Entries<T> {
    return Object.entries(obj) as any
}

type UserFails = [id: string, amount: number]

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        let failLocation = config.COUNTING_GAME.FAILURE_LOCATION

        if (!fs.existsSync(failLocation)) return message.channel.send('ei ollenkaan tallennettuja mokia')

        const sortFails = (a: UserFails, b: UserFails) => {
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
        const sorted = failData.sort(sortFails)

        embed.setTitle('pahimmat mokaajat, nasty')

        const promises = sorted.slice(0, 5).map(async (data) => {
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
