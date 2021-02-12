export type Milliseconds = number

export interface Ban {
    date: Milliseconds
    duration: Milliseconds | 'permanent'
    reason: string
}

export interface User {
    id: string
    currentBan: Ban | null
    allTimeBans: Ban[] | []
}

export interface UserData {
    [id: string]: User
}
