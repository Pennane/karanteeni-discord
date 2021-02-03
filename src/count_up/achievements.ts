import { Message } from 'discord.js'

type Achievement = [(current: number) => boolean, (current: number, message: Message) => string]

const achievements: Array<Achievement> = [
    //  [(current) => current === 69, (current, message) => 'Nice, ' + "<@" + message.author.id + ">" + ''],
    [(current) => current === 300, (current, message) => '<@' + message.author.id + '> saavutti luvun ' + current],
    [(current) => current === 420, (current, message) => '420 korvenna sitä ' + '<@' + message.author.id + '>'],
    [(current) => current === 6969, (current, message) => 'Ultra nice <@' + message.author.id + '> 6969'],
    [(current) => current === 7500, (current, message) => '<@' + message.author.id + '> saavutti luvun ' + current],
    [
        (current) => current % 500 === 0 && current <= 3000,
        (current, message) => '<@' + message.author.id + '>' + ' saavutti luvun ' + current
    ],
    [
        (current) => current % 1000 === 0 && current > 3000 && current <= 6000,
        (current, message) => '<@' + message.author.id + '>' + ' saavutti luvun ' + current
    ],
    [
        (current) => current % 2500 === 0 && current > 6000,
        (current, message) => '<@' + message.author.id + '>' + ' saavutti luvun ' + current
    ]
]

export default achievements
