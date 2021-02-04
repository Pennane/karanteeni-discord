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
    // {
    //     name: 'test',
    //     emoji: {
    //         name: '🎉',
    //         id: null,
    //         custom: false
    //     },
    //     location: {
    //         channel: '749663615547605142',
    //         message: '806858792447770636'
    //     },
    //     actions: [
    //         {
    //             type: 'message',
    //             addMessage: 'Testi message. Useampi reaktio action',
    //             removeMessage: 'poistit reaktion, ja poistin roolin',
    //             target: 'sameuser'
    //         },
    //         {
    //             type: 'message',
    //             addMessage: 'Testi message. Useampi reaktio action',
    //             removeMessage: 'poistit reaktion, ja poistin roolin',
    //             target: 'samechannel'
    //         },
    //         {
    //             type: 'message',
    //             addMessage: 'Testi message. Eri channel kuin missä reaktio',
    //             removeMessage: 'poistit reaktion,  Eri channel kuin missä reaktio',
    //             target: 'channel',
    //             targetChannel: '804096001191182338'
    //         },
    //         { type: 'role', name: 'testi', removable: true }
    //     ]
    // },
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
