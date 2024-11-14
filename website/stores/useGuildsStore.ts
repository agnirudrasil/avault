import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { Channel } from "../types/channels";
import { useChannelsStore } from "./useChannelsStore";
import { Roles, useRolesStore } from "./useRolesStore";
import { GuildMembers, User } from "./useUserStore";

export interface Emoji {
    id: string;
    name: string;
    roles: string[];
    animated: boolean;
    user: User;
}
export interface Guild {
    id: string;
    owner_id: string;
    name: string;
    roles: Roles[];
    channels: Channel[];
    icon?: string;
    emojis: Emoji[];
    members: { [id: string]: GuildMembers };
}

export interface GuildPreview {
    name: string;
    id: string;
    icon?: string;
}

export const useGuildsStore = create(
    combine(
        {
            guilds: {} as Record<string, Guild>,
            guildPreview: {} as Record<string, GuildPreview>,
        },
        set => ({
            setGuilds: (guilds: Guild[]) =>
                set(state =>
                    produce(state, state => {
                        for (let guild of guilds) {
                            const members: { [id: string]: GuildMembers } = {};
                            for (let member of guild.members as unknown as GuildMembers[]) {
                                members[member.user.id] = member;
                            }
                            guild.members = members;
                            state.guilds[guild.id] = guild;
                            state.guildPreview[guild.id] = {
                                name: guild.name,
                                id: guild.id,
                                icon: guild.icon,
                            };
                        }
                    })
                ),
            updateGuild: (guild: Guild) => {
                set(state =>
                    produce(state, draft => {
                        console.log(guild);
                        draft.guilds[guild.id] = {
                            ...draft.guilds[guild.id],
                            ...guild,
                        };
                        draft.guildPreview[guild.id] = {
                            name: guild.name,
                            id: guild.id,
                            icon: guild.icon,
                        };
                    })
                );
            },
            updateEmojis: (guildId: string, emojis: Emoji[]) => {
                set(
                    produce(draft => {
                        draft.guilds[guildId].emojis = emojis;
                    })
                );
            },
            updateMember: (member: GuildMembers) => {
                set(state =>
                    produce(state, draft => {
                        if (draft.guilds[member.guild_id]) {
                            draft.guilds[member.guild_id].members[
                                member.user.id
                            ] = member;
                        }
                    })
                );
            },
            removeMember: (member: GuildMembers) => {
                set(state =>
                    produce(state, draft => {
                        delete draft.guilds[member.guild_id].members[
                            member.user.id
                        ];
                    })
                );
            },
            addMember: (member: GuildMembers) => {
                set(state =>
                    produce(state, draft => {
                        if (draft.guilds[member.guild_id]) {
                            draft.guilds[member.guild_id].members[
                                member.user.id
                            ] = member;
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
                        draft.guilds[guild.id] = guild;
                        draft.guildPreview[guild.id] = {
                            name: guild.name,
                            id: guild.id,
                        };
                        draft.guilds[guild.id].members = (
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
                set(state =>
                    produce(state, draft => {
                        const deleteGuild =
                            useChannelsStore.getState().deleteGuild;
                        const deleteRoles =
                            useRolesStore.getState().deleteGuild;
                        deleteGuild(guildId);
                        deleteRoles(guildId);
                        delete draft.guilds[guildId];
                        delete draft.guildPreview[guildId];
                        return draft;
                    })
                ),
        })
    )
);
