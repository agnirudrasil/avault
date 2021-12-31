import { useMemo } from "react";
import { computePermissions } from "../src/compute-permissions";
import { useChannelsStore } from "../stores/useChannelsStore";
import { useGuildsStore } from "../stores/useGuildsStore";
import { useRolesStore } from "../stores/useRolesStore";
import { useUserStore } from "../stores/useUserStore";

export const usePermssions = (guildId: string, channelId: string) => {
    const roles = useRolesStore(state => state[guildId]);
    const guild = useGuildsStore(state => state[guildId]) ?? {};
    const guildMember = useUserStore(state => state.members[guildId]) ?? {};
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
