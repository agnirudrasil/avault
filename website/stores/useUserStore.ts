import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";

export interface User {
    username: string;
    tag: string;
    email: string;
    id: string;
}

export interface GuildMembers {
    guild_id: string;
    nick?: string;
    user: User;
    roles: string[];
    is_owner: boolean;
}

export const useUserStore = create(
    combine(
        {
            user: {} as User,
            members: {} as Record<string, GuildMembers>,
        },
        (set, get) => ({
            setUser: (user: User, guildMembers: GuildMembers[]) => {
                set(() => {
                    const membersMap: Record<string, GuildMembers> = {};
                    guildMembers.forEach(m => {
                        membersMap[m.guild_id] = m;
                    });
                    return { user, members: membersMap };
                });
            },
            addGuildMembers: (m: GuildMembers) => {
                set(state =>
                    produce(state, draft => {
                        draft.members[m.guild_id] = m;
                    })
                );
            },
            removeGuildMembers: (guildId: string) => {
                set(state => {
                    delete state.members[guildId];
                });
            },
            updateGuildMembers: (guildMembers: GuildMembers) => {
                set(state =>
                    produce(state, draft => {
                        draft.members[guildMembers.guild_id] = guildMembers;
                    })
                );
            },
            isUserMe: (id: string) => {
                const user = get().user;
                return user.id === id;
            },
        })
    )
);
