import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { Channel } from "../types/channels";
import { useChannelsStore } from "./useChannelsStore";
import { Roles, useRolesStore } from "./useRolesStore";
import { GuildMembers, useUserStore } from "./useUserStore";

export interface Guild {
    id: string;
    owner_id: string;
    name: string;
    roles: Roles[];
    channels: Channel[];
    members: GuildMembers[];
}

export const useGuildsStore = create(
    combine({ ...({} as Record<string, Guild>) }, set => ({
        setGuilds: (guilds: any[]) =>
            set(() => {
                const guildsMap: Record<string, any> = {};
                guilds.forEach(guild => {
                    guildsMap[guild.id] = guild;
                });
                return guildsMap;
            }),
        updateGuild: (guild: Guild) => {
            set(state =>
                produce(state, draft => {
                    draft[guild.id] = guild;
                })
            );
        },
        addGuilds: ({
            guild,
            member,
        }: {
            guild: Guild;
            member: GuildMembers;
        }) => {
            const addGuild = useChannelsStore.getState().addGuild;
            const addRoles = useRolesStore.getState().addGuild;
            const addMember = useUserStore.getState().addGuildMembers;
            addGuild(guild.id, guild.channels);
            addRoles(guild.id, guild.roles);
            addMember(member);
            return set(state =>
                produce(state, draft => {
                    draft[guild.id] = guild;
                })
            );
        },
        removeGuild: (guildId: string) =>
            set(state => {
                const deleteGuild = useChannelsStore.getState().deleteGuild;
                const deleteRoles = useRolesStore.getState().deleteGuild;
                const deleteMember = useUserStore.getState().removeGuildMembers;
                deleteGuild(guildId);
                deleteRoles(guildId);
                deleteMember(guildId);
                return produce(state, draft => {
                    delete draft[guildId];
                });
            }),
    }))
);
