type ChannelId = string
import { Action } from './actions'

export interface ReactionListener {
    name: string
    emoji: {
        name: string
        id: string | null
        custom: boolean
    }
    location: {
        channel: string
        message: string
    }
    actions: Array<Action>
}

const listeners: Array<ReactionListener> = [
    {
        name: 'test',
        emoji: {
            name: '🎉',
            id: null,
            custom: false
        },
        location: {
            channel: '804096001191182338',
            message: '806502642519769128'
        },
        actions: [
            { type: 'message', addMessage: null, removeMessage: 'gäng', target: 'sameuser' },
            { type: 'role', name: 'testi', removable: true }
        ]
    },
    {
        name: 'notificationsRole',
        emoji: {
            name: '❗',
            id: null,
            custom: false
        },
        location: {
            channel: '726876806661013584',
            message: '726879559986839685'
        },
        actions: [
            {
                type: 'role',
                name: 'Ilmoitukset',
                removable: true
            }
        ]
    },
    {
        name: 'twitchNotificationsRole',
        emoji: {
            name: 'Twitch',
            id: '749601508806623273',
            custom: true
        },
        location: {
            channel: '726876806661013584',
            message: '726879559986839685'
        },
        actions: [
            {
                type: 'role',
                name: 'Twitch',
                removable: true
            }
        ]
    }
]

export default listeners
