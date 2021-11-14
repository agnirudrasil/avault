export const permissions = [
    {
        name: "VIEW_CHANNELS",
        title: "View Channels",
        description:
            "Allows members to view channels by default (excluding private channels)",
        bit: BigInt(1),
    },
    {
        name: "MANAGE_CHANNELS",
        title: "Manage Channels",
        description: "Allows members to create, edit, or delete channels",
        bit: BigInt(2),
    },
    {
        name: "MANAGE_ROLES",
        title: "Manage Roles",
        description:
            "Allows members to create new roles and edit or delete roles lower that their highest roles. Also allows members to change permissions of individual channels they have access to.",
        bit: BigInt(4),
    },
    {
        name: "MANAGE_EMOJIS_AND_STICKERS",
        title: "Manage Emojis and Stickers",
        description:
            "Allows members to add or remove custome emojis and stickers in this server",
        bit: BigInt(8),
    },
    {
        name: "VIEW_AUDIT_LOG",
        title: "View Audit Log",
        description:
            "Allows members to view a record of who made which changes in this server",
        bit: BigInt(16),
    },
    {
        name: "MANAGE_WEBHOOKS",
        title: "Manage Webhooks",
        description:
            "Allows members to create, edit, or delete webhooks, which can post messages from other apps or sites into this server",
        bit: BigInt(32),
    },
    {
        name: "MANAGE_SERVER",
        title: "Manage Server",
        description:
            "Allows members to change this server's name, switch regions, and add bots to this server",
        bit: BigInt(64),
    },
    {
        name: "CREATE_INVITE",
        title: "Create Invite",
        description: "Allows members to invite new people to this server",
        bit: BigInt(128),
    },
    {
        name: "CHANGE_NICKNAME",
        title: "Change Nickname",
        description:
            "Allows members to change their own nickname, a custom name for just this server",
        bit: BigInt(256),
    },
];
