import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../../.env` })

let PREFIX = '/'

let COUNTING_GAME = {
    DATA_LOCATION: '../data/countgame.json',
    FAILURE_LOCATION: '../data/failures.json'
}

let DISCORD = {
    ID_MAP: {
        GUILD: '206518503144947712',
        CHANNELS: {
            CURRENT_PLAYERS_ON_MINECRAFT_SERVER: '726867745328595005',
            ALL_PLAYERS_ON_DISCORD: '726867540134854767',
            TWITCH_NOTIFICATIONS: '749599869609574462',
            COUNT_UP_GAME: '785163774868586517',
            COUNT_UP_ACHIEVEMENTS: '785163776797835265',
            ACTION_LOG: '689853098101047304'
        }
    },
    TOKEN: process.env.DISCORD_TOKEN,
    ADMIN: '143097697828601857'
}

let TWITCH = {
    LISTENER: {
        NGROK: process.env.NGROK,
        HOSTNAME: process.env.TWITCH_HOSTNAME
    },
    CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    SECRET: process.env.TWITCH_CLIENT_SECRET
}

if (process.env.NODE_ENV === 'development') {
    PREFIX = '-'
    DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME = '804096001191182338'
    DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS = '749663615547605142'
    COUNTING_GAME.DATA_LOCATION = '../data/test_countgame.json'
}

const config = {
    PREFIX,
    COUNTING_GAME,
    DISCORD,
    TWITCH
}

export default config
