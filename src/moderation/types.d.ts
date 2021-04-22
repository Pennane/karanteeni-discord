export type Milliseconds = number

export interface Ban {
    date: Milliseconds
    duration: Milliseconds | 'permanent'
    reason: string
}

export interface Warn {
    date: Milliseconds
    reason: string
    id: string
    penalised: boolean
}

export interface User {
    id: string
    currentBan: Ban | null
    allTimeBans: Ban[]
    warns: Warn[]
}

export type EmptyUser = Omit<User, id>

export interface UserData {
    [id: string]: User
}
