import {IdentifyObject} from "./event-objects";

export interface ClientToServerEvents {
    IDENTIFY: (identify: IdentifyObject) => void;
}

export interface ServerToClientEvents {
    CHANNEL_CREATE: (channel: any) => void;
    CHANNEL_UPDATE: (channel: any) => void;
    CHANNEL_DELETE: (channel: any) => void;
    CHANNEL_PINS_UPDATE: (channel: any) => void;
    THREAD_CREATE: (channel: any) => void;
    THREAD_DELETE: (channel: any) => void;
    THREAD_LIST_SYNC: (channel: any) => void;
    THREAD_MEMBER_UPDATE: (channel: any) => void;
    THREAD_MEMBERS_UPDATE: (channel: any) => void;
    GUILD_CREATE: (guild: any) => void;
    GUILD_UPDATE: (guild: any) => void;
    GUILD_DELETE: (guild: any) => void;
    GUILD_BAN_ADD: (guild: any) => void;
    GUILD_BAN_REMOVE: (guild: any) => void;
    GUILD_EMOJIS_UPDATE: (guild: any) => void;
    GUILD_STICKERS_UPDATE: (guild: any) => void;
    GUILD_MEMBER_ADD: (guild: any) => void;
    GUILD_MEMBER_REMOVE: (guild: any) => void;
    GUILD_MEMBER_UPDATE: (guild: any) => void;
    GUILD_ROLE_CREATE: (guild: any) => void;
    GUILD_ROLE_UPDATE: (guild: any) => void;
    GUILD_ROLE_DELETE: (guild: any) => void;
    INVITE_CREATE: (invite: any) => void;
    INVITE_DELETE: (invite: any) => void;
    MESSAGE_CREATE: (message: any) => void;
    MESSAGE_UPDATE: (message: any) => void;
    MESSAGE_DELETE: (message: any) => void;
    MESSAGE_DELETE_BULK: (message: any) => void;
    MESSAGE_REACTION_ADD: (message: any) => void;
    MESSAGE_REACTION_REMOVE: (message: any) => void;
    MESSAGE_REACTION_REMOVE_ALL: (message: any) => void;
    MESSAGE_REACTION_REMOVE_EMOJI: (message: any) => void;
    TYPING_START: (typing: any) => void;
    WEBHOOKS_UPDATE: (webhooks: any) => void;
}
