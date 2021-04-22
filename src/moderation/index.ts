import { currentlyTempBannedUsers } from './functionality'
import { listenForUnban } from './utils'
export * from './functionality'

const listenForExpiringBans = async () => {
    let currentlyBanned = await currentlyTempBannedUsers()

    currentlyBanned.forEach((user) => {
        listenForUnban(user)
    })
}

listenForExpiringBans()
