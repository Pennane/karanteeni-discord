import Discord from 'discord.js'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { Ban, EmptyUser, Milliseconds, User, UserData, Warn } from './types'
import { discordUnban, discordBan, listenForUnban, informUser, informInActionLog } from './utils'

const userDataLocation = '../data/banned.json'
let client: Discord.Client

const emptyUserData: EmptyUser = {
    currentBan: null,
    allTimeBans: [],
    warns: []
}

const readUserData = async (): Promise<UserData> => {
    let file
    try {
        file = await fs.open(userDataLocation, 'r')
    } catch {
        await fs.writeFile(userDataLocation, '{}')
    } finally {
        if (file) file.close()
    }

    const data = await fs.readFile(userDataLocation, 'utf8')
    return JSON.parse(data)
}

const writeUserData = async (data: UserData): Promise<void> => {
    await fs.writeFile(userDataLocation, JSON.stringify(data))
}

export const fetchUser = async (userid: string): Promise<User | null> => {
    const userData = await readUserData()
    const user = userData[userid]
    return user ? user : null
}

const setUser = async (user: User): Promise<User> => {
    const userData = await readUserData()
    const newData = { ...userData, [user.id]: user }
    await writeUserData(newData)
    return user
}

const createUser = async (userid: string): Promise<User> => {
    const oldUser = await fetchUser(userid)
    if (oldUser) throw new Error('Tried to create a new user on top of old one')
    const data: User = {
        ...emptyUserData,
        id: userid
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

export const currentBan = async (userid: string): Promise<Ban | null> => {
    const user = await fetchUser(userid)
    if (!user || !user.currentBan) return null
    let now = Date.now()
    if (user.currentBan.duration === 'permanent' || now - (user.currentBan.date + user.currentBan.duration) <= 0) {
        return user.currentBan
    }

    return null
}

export const ban = async (userid: string, duration: Milliseconds | 'permanent', reason: string): Promise<Ban> => {
    let user = await fetchUser(userid)
    if (!user) {
        user = await createUser(userid)
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
    informInActionLog(`<@${userid}> on bannatty`)
    await informUser(
        userid,
        'Sinut on bannittu karanteenin discordista.',
        `Syy: ${reason}\n
        ${
            ban.duration === 'permanent'
                ? `Bannit ovat ikuiset.`
                : `Banni päättyy: ${new Date(ban.date + (ban.duration as number)).toLocaleDateString('fi')}`
        }`
    )

    discordBan(userid, reason, client)
    listenForUnban(data)

    await setUser(data)
    return ban
}

export const unban = async (userid: string): Promise<User | null> => {
    let user = await fetchUser(userid)
    if (!user) return null
    const data = {
        ...user,
        currentBan: null
    }
    discordUnban(userid, client)
    informUser(
        userid,
        'Bannisi ovat loppuneet.',
        `Bannisi ovat loppuneet tai manuaalisesti poistettu karanteenin discordista.`
    )
    return await setUser(data)
}

export const getBans = async (userid: string): Promise<Ban[] | null> => {
    let user = await fetchUser(userid)
    if (!user) return null
    return user.allTimeBans
}

interface WarnInformation extends Warn {
    causedBan: boolean
}

export const warn = async (userid: string, reason: string): Promise<WarnInformation> => {
    let user = await fetchUser(userid)
    if (!user) {
        user = await createUser(userid)
    }

    let causedBan = false

    const warn: Warn = {
        date: Date.now(),
        reason,
        id: uuidv4(),
        penalised: false
    }

    await informUser(
        userid,
        'Sinua on varoitettu karanteenin discordissa.',
        `Syy: ${reason}\n
        (Kolmesta varoituksesta tulee automaattinen ban)`
    )

    if (user.warns.filter((warn) => warn.penalised === false).length + 1 >= 3) {
        // auto ban for 14 d
        try {
            await ban(userid, 1_209_600_000, 'Varoitusrajan ylitys')
            causedBan = true
        } catch {
            console.error('FAILED TO BAN ON 3 WARNS')
        }
    }

    let newWarns = causedBan
        ? user.warns.concat(warn).map((warn) => {
              return { ...warn, penalised: true }
          })
        : user.warns.concat(warn)

    const data = {
        ...(await fetchUser(userid)),
        warns: newWarns
    } as User

    await setUser(data)

    return { ...warn, causedBan }
}

export const unwarn = async (id: string, warnId: string): Promise<User | null> => {
    let user = await fetchUser(id)
    if (!user) return null

    if (!user.warns.some((warn) => warn.id === warnId)) {
        return null
    }

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

export const clearwarns = async (id: string): Promise<User | null> => {
    let user = await fetchUser(id)
    if (!user) return null

    const data: User = {
        ...user,
        warns: []
    }

    informUser(id, 'Varoituksesi on poistettu.', `Varoituksesi on tyhjennetty karanteenin discordissa.`)

    return await setUser(data)
}

export const getWarns = async (userid: string): Promise<Warn[] | null> => {
    let user = await fetchUser(userid)
    if (!user) return null
    return user.warns
}

export const init = (_client: Discord.Client): void => {
    client = _client
}
