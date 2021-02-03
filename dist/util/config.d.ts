declare const config: {
    PREFIX: string;
    COUNTING_GAME: {
        DATA_LOCATION: string;
    };
    DISCORD: {
        ID_MAP: {
            GUILD: string;
            CHANNELS: {
                CURRENT_PLAYERS_ON_MINECRAFT_SERVER: string;
                ALL_PLAYERS_ON_DISCORD: string;
                TWITCH_NOTIFICATIONS: string;
                COUNT_UP_GAME: string;
                COUNT_UP_ACHIEVEMENTS: string;
            };
        };
        TOKEN: string | undefined;
        ADMIN: string;
    };
    TWITCH: {
        LISTENER: {
            NGROK: string | undefined;
            HOSTNAME: string | undefined;
        };
        CLIENT_ID: string | undefined;
        SECRET: string | undefined;
    };
};
export default config;
