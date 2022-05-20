import { Channel } from "../types/channels";

export const getGroupDMName = (channel: Channel) => {
    if (channel.type === "GROUP_DM") {
        return channel.name || channel.recipients?.length > 0
            ? channel.recipients.map(c => c.username).join(", ")
            : "Unnamed";
    }
    return "";
};
