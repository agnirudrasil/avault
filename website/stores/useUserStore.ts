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
    user_id: string;
    user: User;
    roles: string[];
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
            isUserMe: (id: string) => {
                const user = get().user;
                return user.id === id;
            },
        })
    )
);
