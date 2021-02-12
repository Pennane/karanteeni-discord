import cron from 'node-schedule'
import { currentlyTempBannedUsers, unban } from './functionality'
export * from './functionality'

cron.scheduleJob('0 */1 * * *', async () => {
    let now = Date.now()
    let currentlyBanned = await currentlyTempBannedUsers()
    currentlyBanned.forEach((user) => {
        let ban = user.currentBan
        if (!ban || ban.duration === 'permanent') return
        if (now - (ban.date + ban.duration) > 0) {
            unban(user.id)
            console.log('unbanned ' + user.id)
        }
    })
})
