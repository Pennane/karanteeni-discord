import Discord from 'discord.js'
import fs from 'fs/promises'
import uuid from 'uuid'
import { Ban, EmptyUser, Milliseconds, User, UserData, Warn } from './types'
import { discordUnban, discordBan, listenForUnban, informUser } from './utils'

const userDataLocation = '../data/banned.json'
let client: Discord.Client

const emptyUserData: EmptyUser = {
    currentBan: null,
    allTimeBans: [],
    warns: []
}

const readUserData = async (): Promise<UserData> => {
    const file = await fs.stat(userDataLocation)
    if (!file) {
        await fs.writeFile(userDataLocation, JSON.stringify('{}'))
    }
    const data = await fs.readFile(userDataLocation, 'utf8')
    return JSON.parse(data)
}

const writeUserData = async (data: UserData): Promise<void> => {
    await fs.writeFile(userDataLocation, JSON.stringify(data))
}

const fetchUser = async (id: string): Promise<User | null> => {
    const userData = await readUserData()
    const user = userData[id]
    return user ? user : null
}

const setUser = async (user: User): Promise<User> => {
    const userData = await readUserData()
    const newData = { ...userData, [user.id]: user }
    await writeUserData(newData)
    return user
}

const createUser = async (id: string): Promise<User> => {
    const oldUser = await fetchUser(id)
    if (oldUser) throw new Error('Tried to create a new user on top of old one')
    const data: User = {
        ...emptyUserData,
        id
    } as User

    try {
        await setUser(data)
        return data
    } catch (e) {
        throw console.error('FAILED TO CREATE USER')
    }
}

export const currentlyTempBannedUsers = async (): Promise<User[]> => {
    const data = await readUserData()
    let users: User[] = []
    for (let user in data) {
        data[user].currentBan && data[user].currentBan?.duration !== 'permanent' ? users.push(data[user]) : null
    }
    return users
}

export const currentlyPemanentlyBannedUsers = async (): Promise<User[]> => {
    const data = await readUserData()
    let users: User[] = []
    for (let user in data) {
        data[user].currentBan && data[user].currentBan?.duration === 'permanent' ? users.push(data[user]) : null
    }
    return users
}

export const currentlyBannedUsers = async (): Promise<User[]> => {
    const data = await readUserData()
    let users: User[] = []
    for (let user in data) {
        data[user].currentBan ? users.push(data[user]) : null
    }
    return users
}

export const currentBan = async (id: string): Promise<Ban | null> => {
    const user = await fetchUser(id)
    if (!user || !user.currentBan) return null
    let now = Date.now()
    if (user.currentBan.duration === 'permanent' || now - (user.currentBan.date + user.currentBan.duration) <= 0) {
        return user.currentBan
    }

    return null
}

export const ban = async (id: string, duration: Milliseconds | 'permanent', reason: string): Promise<Ban> => {
    let user = await fetchUser(id)
    if (!user) {
        user = await createUser(id)
    }

    const ban = {
        date: Date.now(),
        duration,
        reason
    }

    const data = {
        ...user,
        currentBan: ban,
        allTimeBans: [...user.allTimeBans, ban]
    }

    discordBan(id, reason, client)
    listenForUnban(data)
    informUser(
        id,
        'Sinut on bannittu karanteenin discordista.',
        `Syy: ${reason}\n
        ${
            ban.duration === 'permanent'
                ? `Bannit ovat ikuiset.`
                : `Banni päättyy: ${new Date(ban.date + (ban.duration as number))}`
        }`
    )
    await setUser(data)
    return ban
}

export const unban = async (id: string): Promise<User | null> => {
    let user = await fetchUser(id)
    if (!user) return null
    const data = {
        ...user,
        currentBan: null
    }
    discordUnban(id, client)
    informUser(
        id,
        'Bannisi ovat loppuneet.',
        `Bannisi ovat loppuneet tai manuaalisesti poistettu karanteenin discordista.`
    )
    return await setUser(data)
}

export const init = (_client: Discord.Client): void => {
    client = _client
}

export const warn = async (id: string, reason: string): Promise<Warn> => {
    let user = await fetchUser(id)
    if (!user) {
        user = await createUser(id)
    }

    const warn = {
        date: Date.now(),
        reason,
        id: uuid.v5('warn', 'karanteeni-moderation')
    }

    const data = {
        ...user,
        warns: [...user.warns, warn]
    }

    informUser(
        id,
        'Sinua on varoitettu karanteenin discordissa.',
        `Syy: ${reason}\n
        (Kolmesta varoituksesta tulee automaattinen ban)`
    )
    await setUser(data)
    return warn
}

export const unwarn = async (id: string, warnId: string): Promise<User | null> => {
    let user = await fetchUser(id)
    if (!user) return null

    const data: User = {
        ...user,
        warns: user.warns.filter((warn) => warn.id !== warnId)
    }

    informUser(
        id,
        'Varoituksesi on erääntynyt.',
        `Varoituksesi on erääntynyt tai se on manuaalisesti poistettu karanteenin discordista.`
    )

    return await setUser(data)
}
