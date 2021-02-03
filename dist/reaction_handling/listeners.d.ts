export interface ReactionListener {
    name: string;
    emoji: {
        name: string;
        id: string | null;
        custom: boolean;
    };
    location: {
        channel: string;
        message: string;
    };
    role: {
        name: string;
        removable: boolean;
    };
}
declare const listeners: Array<ReactionListener>;
export default listeners;
