import { memberHasRole, toggleRole } from '../util/discordutil'
import { ReactionParseInput } from './index'
import configuration from '../util/config'
import Discord from 'discord.js'

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

const parseMessageTarget = async (
    action: MessageAction,
    event: ReactionParseInput
): Promise<Discord.TextChannel | Discord.User | null> => {
    const { client, user, reaction } = event
    const { target, targetChannel } = action
    switch (target) {
        case 'sameuser':
            return user
        case 'samechannel':
            return reaction.message.channel as Discord.TextChannel
        case 'channel':
            if (!targetChannel) return null
            return (await client.channels.fetch(targetChannel)) as Discord.TextChannel
        default:
            return null
    }
}

const handleMessageAction = async (action: MessageAction, event: ReactionParseInput) => {
    if (event.type === 'ADD' && action.addMessage) {
        const target = await parseMessageTarget(action, event)
        if (!target) return
        target.send(action.addMessage)
    } else if (event.type === 'REMOVE' && action.removeMessage) {
        const target = await parseMessageTarget(action, event)
        if (!target) return
        target.send(action.removeMessage)
    }
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
