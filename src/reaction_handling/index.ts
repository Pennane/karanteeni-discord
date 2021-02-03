import Discord from 'discord.js'
import listeners from './listeners'
import configuration from '../util/config'
import { handleAction } from './actions'

let client: Discord.Client

export interface ReactionParseInput {
    client: Discord.Client
    reaction: Discord.MessageReaction
    user: Discord.User
    type: 'ADD' | 'REMOVE'
}

// const roleReactionListeners = (): Array<ReactionListener> => {
//     const reducer = (s: Array<ReactionListener>, l: ReactionListener): Array<ReactionListener> => {
//         let filtered = l.actions.filter((a) => a.type === 'role')
//         return filtered ? s.concat({ ...l, actions: filtered }) : s
//     }
//     return listeners.reduce(reducer, [])
// }

const cacheRequiredMessages = (client: Discord.Client) => {
    for (let listener of listeners) {
        client
    }
}

export const handle = async (event: ReactionParseInput): Promise<void> => {
    const { client, reaction, user, type } = event
    if (!user || user.bot || !reaction || !client || !type) return

    let reactionListener = listeners.find((listener) => {
        let correctChannel = listener.location.message === event.reaction.message.id
        let correctEmoji =
            event.reaction.emoji.id === null
                ? listener.emoji.name === event.reaction.emoji.name
                : listener.emoji.id === event.reaction.emoji.id
        return correctChannel && correctEmoji
    })
    if (!reactionListener) return

    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

    let member = guild.member(user)
    if (!member) return

    for (let action of reactionListener.actions) {
        handleAction(action, event)
    }
}

const init = (passedClient: Discord.Client) => {
    cacheRequiredMessages(passedClient)
    client = passedClient
}

export default init
