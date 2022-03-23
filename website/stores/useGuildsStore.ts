import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { Channel } from "../types/channels";
import { useChannelsStore } from "./useChannelsStore";
import { Roles, useRolesStore } from "./useRolesStore";
import { GuildMembers } from "./useUserStore";

export interface Guild {
    id: string;
    owner_id: string;
    name: string;
    roles: Roles[];
    channels: Channel[];
    members: { [id: string]: GuildMembers };
}

export const useGuildsStore = create(
    combine({ ...({} as Record<string, Guild>) }, set => ({
        setGuilds: (guilds: any[]) =>
            set(() => {
                const guildsMap: Record<string, any> = {};
                guilds.forEach(guild => {
                    guildsMap[guild.id] = guild;
                    guildsMap[guild.id].members = (
                        guild.members as GuildMembers[]
                    ).reduce(
                        (acc, curr) => ((acc[curr.user.id] = curr), acc),
                        {} as {
                            [id: string]: GuildMembers;
                        }
                    );
                });
                return guildsMap;
            }),
        updateGuild: (guild: Guild) => {
            set(state =>
                produce(state, draft => {
                    const members = draft[guild.id].members;
                    draft[guild.id] = guild;
                    draft[guild.id].members = members;
                })
            );
        },
        updateMember: (member: GuildMembers) => {
            set(state =>
                produce(state, draft => {
                    if (draft[member.guild_id]) {
                        draft[member.guild_id].members[member.user.id] = member;
                    }
                })
            );
        },
        removeMember: (member: GuildMembers) => {
            set(state =>
                produce(state, draft => {
                    delete draft[member.guild_id].members[member.user.id];
                })
            );
        },
        addMember: (member: GuildMembers) => {
            set(state =>
                produce(state, draft => {
                    if (draft[member.guild_id]) {
                        draft[member.guild_id].members[member.user.id] = member;
                    }
                })
            );
        },
        addGuilds: ({ guild }: { guild: Guild; member: GuildMembers }) => {
            const addGuild = useChannelsStore.getState().addGuild;
            const addRoles = useRolesStore.getState().addGuild;
            addGuild(guild.id, guild.channels);
            addRoles(guild.id, guild.roles);

            return set(state =>
                produce(state, draft => {
                    draft[guild.id] = guild;
                    draft[guild.id].members = (
                        guild.members as unknown as GuildMembers[]
                    ).reduce(
                        (acc, curr) => ((acc[curr.user.id] = curr), acc),
                        {} as {
                            [id: string]: GuildMembers;
                        }
                    );
                })
            );
        },
        removeGuild: (guildId: string) =>
            set(state => {
                const deleteGuild = useChannelsStore.getState().deleteGuild;
                const deleteRoles = useRolesStore.getState().deleteGuild;
                deleteGuild(guildId);
                deleteRoles(guildId);
                delete state[guildId];
                return state;
            }),
    }))
);
