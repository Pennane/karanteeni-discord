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
    role: {
        name: string
        removable: boolean
    }
}

const listeners: Array<ReactionListener> = [
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
        role: {
            name: 'Ilmoitukset',
            removable: true
        }
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
        role: {
            name: 'Twitch',
            removable: true
        }
    }
]

export default listeners