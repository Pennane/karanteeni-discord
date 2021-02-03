import { memberHasRole, toggleRole } from '../util/discordutil'
import { ReactionParseInput } from './index'
import configuration from '../util/config'

const actions = new Map()

export type Action = MessageAction | RoleAction

interface BaseAction {
    type: string
}

export interface MessageAction extends BaseAction {
    type: 'message'
    addMessage: string | null
    removeMessage: string | null
    target: 'sameuser' | 'samechannel' | 'channel'
    targetChannel?: string
}

const handleMessageAction = (action: MessageAction, event: ReactionParseInput) => {
    console.info('in handle message actoin')
    console.info(action)
}

export interface RoleAction extends BaseAction {
    type: 'role'
    name: string
    removable: boolean
}

const handleRoleAction = (action: RoleAction, event: ReactionParseInput) => {
    const { client, user } = event
    const guild = client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)
    const member = guild?.members.cache.get(user.id)
    if (!member) return console.error('failed to handle role action, no member')

    if (event.type === 'ADD') {
        toggleRole(member, action.name, 'ADD')
    } else if (event.type === 'REMOVE' && action.removable) {
        toggleRole(member, action.name, 'REMOVE')
    }
}

export const handleAction = (action: Action, event: ReactionParseInput) => {
    switch (action.type) {
        case 'message':
            return handleMessageAction(action, event)
        case 'role':
            return handleRoleAction(action, event)
        default:
            return null
    }
}
