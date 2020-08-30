


const authorize = require('../authorize.json')

const axios = require('axios')
const { ApiClient } = require('twitch')
const { StaticAuthProvider } = require('twitch-auth');
const { SimpleAdapter, WebHookListener } = require('twitch-webhooks');

const clientId = authorize.twitch.clientId;
const clientSecret = authorize.twitch.clientSecret;

const { EventEmitter } = require('events');

const TwitchEmitter = new EventEmitter();
module.exports = TwitchEmitter

setTimeout(()=>{
    TwitchEmitter.emit("streamChange", {
        type: "online",
        data: {
            user: "susseduud",
            title: "Pelataan kovemman luokan lorem ipsum",
            thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_susseduud-{width}x{height}.jpg',
            profilePicture: 'https://static-cdn.jtvnw.net/jtv_user_pictures/susseduud-profile_image-a8c263149d4c32eb-300x300.png'
        }
    
    });
},3000)

return


const twitchUserName = "karanteeniserver"
const twitchUserId = "516475106"


/*
const twitchUserName = "susseduud"
const twitchUserId = "79715615"
*/

axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
    .then(async (response) => {
        let accessToken = response.data.access_token;

        const authProvider = new StaticAuthProvider(clientId, accessToken);
        const apiClient = new ApiClient({ authProvider });

        const user = await apiClient.helix.users.getUserById(twitchUserId);

        /*
        const listener = new WebHookListener(apiClient, new SimpleAdapter({
        hostName: '178.251.144.69',
            listenerPort: 3000
        }));
        */

        const listener = await WebHookListener.create(apiClient, {
            hostName: "b82443d71f37.ngrok.io",
            port: 8090,
            reverseProxy: { port: 443, ssl: true }
        })
        
        console.log(user)

        listener.listen();

        let prevStream = await apiClient.helix.streams.getStreamByUserName(twitchUserId);

        const subscription = await listener.subscribeToStreamChanges(twitchUserId, async (stream) => {
            if (stream) {
                if (!prevStream) {
                    console.log("Detected that stream went ONLINE")
                    TwitchEmitter.emit("streamChange", {
                        type: "online",
                        data: {
                            user: stream.userDisplayName,
                            title: stream.title,
                            thumbnail: stream.thumbnailUrl,
                            profilePicture: user.profilePictureUrl,
                            offlineImage: user.offline_image_url || null
                        }
                    });
                }
            } else {
                console.log("Detected that stream went offline")
                TwitchEmitter.emit("streamChange", {
                    type: "offline",
                    data: {
                        user: user.displayName,
                        profilePicture: user.profilePictureUrl
                    }
                });
            }
            prevStream = stream;
        });
    })


module.exports = TwitchEmitter;


