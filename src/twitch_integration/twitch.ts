import configuration from '../util/config'

import axios from 'axios'
import { ApiClient } from 'twitch'
import { StaticAuthProvider } from 'twitch-auth'
import { SimpleAdapter, WebHookListener } from 'twitch-webhooks'

import { EventEmitter } from 'events'
const TwitchEmitter = new EventEmitter()

const clientId = configuration.TWITCH.CLIENT_ID
const clientSecret = configuration.TWITCH.SECRET

const twitchUserId = '516475106'

/* Test emit
setTimeout(() => {
    TwitchEmitter.emit("streamChange", {
        type: "online",
        user: "KaranteeniServer",
        title: "Test",
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_karanteeniserver-{width}x{height}.jpg',
        profilePicture: 'https://static-cdn.jtvnw.net/jtv_user_pictures/3f577ff9-b375-4649-bd57-dd49d68255a8-profile_image-300x300.png'
    });
}, 3000)   
return;
*/

axios
    .post(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    )
    .then(async (response) => {
        let accessToken = response.data.access_token

        const authProvider = new StaticAuthProvider(clientId as string, accessToken)
        const apiClient = new ApiClient({ authProvider })

        const user = await apiClient.helix.users.getUserById(twitchUserId)

        if (!user) throw new Error('missing proper user in twitch')

        let listener

        if (configuration.TWITCH.LISTENER.NGROK) {
            listener = await WebHookListener.create(apiClient, {
                hostName: configuration.TWITCH.LISTENER.HOSTNAME,
                port: 8090,
                reverseProxy: { port: 443, ssl: true }
            })
        } else {
            listener = new WebHookListener(
                apiClient,
                new SimpleAdapter({
                    hostName: configuration.TWITCH.LISTENER.HOSTNAME as string,
                    listenerPort: 8090
                })
            )
        }

        listener.listen()
        let prevStream = await apiClient.helix.streams.getStreamByUserId(twitchUserId)
        const subscription = await listener.subscribeToStreamChanges(twitchUserId, async (stream) => {
            if (stream && !prevStream) {
                let game = stream.gameId ? apiClient.helix.games.getGameById(stream.gameId) : null
                TwitchEmitter.emit('streamChange', {
                    type: 'online',
                    user: stream.userDisplayName,
                    title: stream.title,
                    thumbnail: stream.thumbnailUrl,
                    profilePicture: user.profilePictureUrl,
                    game: await game
                })
            }
            prevStream = stream || null
        })
    })
    .catch((exception): void => {
        console.error('error in twitch module')
        console.error(exception)
    })

export default TwitchEmitter
