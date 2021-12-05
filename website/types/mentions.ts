export type MentionTypes = "role" | "user" | "channel" | "emoji" | "@everyone";
export type MentionIcons = "@" | "#" | "";

export interface Mention {
    type: MentionTypes;
    id: string;
    name: string;
}

export const MentionIcon: Record<MentionTypes, MentionIcons> = {
    channel: "#",
    role: "@",
    user: "@",
    "@everyone": "",
    emoji: "",
};
