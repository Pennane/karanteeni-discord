"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const configuration = require('../util/config');
const axios = require('axios');
const { ApiClient } = require('twitch');
const { StaticAuthProvider } = require('twitch-auth');
const { SimpleAdapter, WebHookListener } = require('twitch-webhooks');
const { EventEmitter } = require('events');
const TwitchEmitter = new EventEmitter();
const clientId = configuration.TWITCH.CLIENT_ID;
const clientSecret = configuration.TWITCH.SECRET;
const twitchUserId = '516475106';
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
    .post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
    .then((response) => __awaiter(void 0, void 0, void 0, function* () {
    let accessToken = response.data.access_token;
    const authProvider = new StaticAuthProvider(clientId, accessToken);
    const apiClient = new ApiClient({ authProvider });
    const user = yield apiClient.helix.users.getUserById(twitchUserId);
    let listener;
    if (configuration.TWITCH.LISTENER.NGROK) {
        listener = yield WebHookListener.create(apiClient, {
            hostName: configuration.TWITCH.LISTENER.HOSTNAME,
            port: 8090,
            reverseProxy: { port: 443, ssl: true }
        });
    }
    else {
        listener = new WebHookListener(apiClient, new SimpleAdapter({
            hostName: configuration.TWITCH.LISTENER.HOSTNAME,
            listenerPort: 8090
        }));
    }
    listener.listen();
    let prevStream = yield apiClient.helix.streams.getStreamByUserId(twitchUserId);
    const subscription = yield listener.subscribeToStreamChanges(twitchUserId, (stream) => __awaiter(void 0, void 0, void 0, function* () {
        if (stream) {
            if (!prevStream) {
                let game = stream.gameId ? apiClient.helix.games.getGameById(stream.gameId) : null;
                TwitchEmitter.emit('streamChange', {
                    type: 'online',
                    user: stream.userDisplayName,
                    title: stream.title,
                    thumbnail: stream.thumbnailUrl,
                    profilePicture: user.profilePictureUrl,
                    offlineImage: user.offline_image_url || null,
                    game: yield game
                });
            }
        }
        prevStream = stream;
    }));
}));
module.exports = TwitchEmitter;
