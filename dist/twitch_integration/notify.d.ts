import Discord from 'discord.js';
interface StreamChange {
    type: string;
    user: string;
    title: string;
    thumbnail: string;
    profilePicture: string;
    game: any;
}
interface NotifyRequest {
    streamChange: StreamChange;
    role: Discord.Role;
    destination: Discord.Channel;
}
declare const notifyRole: (notifyRequest: NotifyRequest) => void;
export default notifyRole;
