import { User } from "../stores/useUserStore";

export enum ChannelTypes {
    guild_text = "GUILD_TEXT",
    dm = "DM",
    guild_category = "GUILD_CATEGORY",
    guild_news = "GUILD_NEWS",
    guild_public_thread = "GUILD_PUBLIC_THREAD",
    guild_private_thread = "GUILD_PRIVATE_THREAD",
    group_dm = "GROUP_DM",
}

export interface Channel {
    icon?: string;
    id: string;
    type: ChannelTypes;
    position?: number;
    name: string;
    topic?: string;
    nsfw: boolean;
    guild_id?: string;
    owner_id?: string;
    parent_id?: string;
    last_read?: string;
    last_message_id?: string;
    last_message_timestamp?: string;
    overwrites: Overwrites[];
    recipients: User[];
}

export interface Overwrites {
    id: string;
    type: 1 | 0;
    allow: string;
    deny: string;
}

export interface ChannelStore {
    privateChannels: Record<string, Channel>;
    channels: Record<string, Record<string, Channel>>;
}
