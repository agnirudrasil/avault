export interface Channel {
    id: string;
    last_message_timestamp: Date | null;
    members: Member[];
    name: string;
}

export interface Member {
    id: string;
    username: string;
    avatar: string;
    is_admin: boolean;
    is_owner: boolean;
    is_bot: boolean;
    is_readonly: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_verified: boolean;
    is_restricted_pending: boolean;
    is_ultra_restricted_pending: boolean;
}
