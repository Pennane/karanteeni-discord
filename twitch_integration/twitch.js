


const authorize = require('../authorize.json')

const axios = require('axios')
const { ApiClient } = require('twitch')
const { StaticAuthProvider } = require('twitch-auth');
const { SimpleAdapter, WebHookListener } = require('twitch-webhooks');

const clientId = authorize.twitch.clientId;
const clientSecret = authorize.twitch.clientSecret;
/*
const twitchUserName = "karanteeniserver"
const twitchUserId = "516475106"
*/

const twitchUserName = "susseduud"
const twitchUserId = "79715615"

axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
    .then(async (response) => {
        let accessToken = response.data.access_token;
       /* console.log(accessToken)
        axios.post('https://api.twitch.tv/helix/users?login=karanteeniserver&token=' + accessToken).then(response => console.log(response))
        return*/
        const authProvider = new StaticAuthProvider(clientId, accessToken);
        const apiClient = new ApiClient({ authProvider });

        const listener = new WebHookListener(apiClient, new SimpleAdapter({
            hostName: '178.251.144.69',
            listenerPort: 3000
        }));

        listener.listen();

        let prevStream = await apiClient.helix.streams.getStreamByUserName(twitchUserId);

        console.log(prevStream)

        module.exports.subscription = await listener.subscribeToStreamChanges(twitchUserId, async (stream) => {
            if (stream) {
                if (!prevStream) {
                    console.log(`${stream.userDisplayName} just went live with title: ${stream.title}`);
                }
            } else {
                // no stream, no display name
                const user = await apiClient.helix.users.getUserById(twitchUserId);
                console.log(`${user.displayName} just went offline`);
            }
            prevStream = stream;
        });
    })



