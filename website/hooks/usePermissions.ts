import { useMemo } from "react";
import { computePermissions } from "../src/compute-permissions";
import { getUser } from "../src/user-cache";
import { useChannelsStore } from "../stores/useChannelsStore";
import { useGuildsStore } from "../stores/useGuildsStore";
import { useRolesStore } from "../stores/useRolesStore";

export const usePermssions = (guildId: string, channelId: string) => {
    const roles = useRolesStore(state => state[guildId]);
    const guild = useGuildsStore(state => state[guildId]) ?? {};
    const guildMember = guild.members?.[getUser()] ?? {};
    console.log(guildMember);
    const channel = useChannelsStore(state => state[guildId]);
    const currentChannel = channel?.find(c => c.id === channelId) || {};
    const permissions = useMemo(
        () =>
            computePermissions(
                roles,
                guild,
                guildMember,
                currentChannel as any
            ),
        [roles, guild, guildMember, currentChannel]
    );
    return { permissions, roles, guild, guildMember, channel, currentChannel };
};
