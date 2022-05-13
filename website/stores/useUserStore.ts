import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";

export interface User {
    username: string;
    tag: string;
    email: string;
    id: string;
    bot?: boolean;
    avatar?: string;
    accent_color?: number;
    banner?: string;
    bio?: string;
    mfa_enabled?: boolean;
    banner_color?: string;
}

export interface GuildMembers {
    guild_id: string;
    nick?: string;
    user: User;
    roles: string[];
    is_owner: boolean;
}

export interface Unread {
    lastMessageId?: string;
    lastMessageTimestamp?: Date;
    lastRead?: string;
    mentionCount?: number;
}

export const useUserStore = create(
    combine(
        {
            user: {} as User,
            members: {} as Record<string, GuildMembers>,
            unread: {} as Record<string, Unread>,
        },
        (set, get) => ({
            updateUser: (user: User) => {
                set(state =>
                    produce(state, draft => {
                        draft.user = user;
                    })
                );
            },
            setUser: (
                user: User,
                guildMembers: GuildMembers[],
                unread: Record<string, Unread>
            ) => {
                set(() => {
                    const membersMap: Record<string, GuildMembers> = {};
                    guildMembers.forEach(m => {
                        membersMap[m.guild_id] = m;
                    });
                    return { user, members: membersMap, unread };
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
            incrementMentions: (channelId: string) => {
                set(state =>
                    produce(state, draft => {
                        if (
                            draft.unread[channelId].mentionCount !== null &&
                            draft.unread[channelId].mentionCount !== undefined
                        ) {
                            draft.unread[channelId]!.mentionCount!++;
                        }
                    })
                );
            },
            updateLastMessage: (
                channelId: string,
                {
                    lastMessageId,
                    lastMessageTimestamp,
                }: { lastMessageId: string; lastMessageTimestamp: Date }
            ) => {
                set(state =>
                    produce(state, draft => {
                        if (draft.unread[channelId]) {
                            draft.unread[channelId].lastMessageId =
                                lastMessageId;
                            draft.unread[channelId].lastMessageTimestamp =
                                lastMessageTimestamp;
                        } else {
                            draft.unread[channelId] = {
                                lastMessageId,
                                lastMessageTimestamp,
                            };
                        }
                    })
                );
            },
            updateUnread: (
                lastMessageId: string,
                channelId: string,
                mentionCount: number
            ) => {
                set(state =>
                    produce(state, draft => {
                        if (draft.unread[channelId]) {
                            draft.unread[channelId].lastRead = lastMessageId;
                            draft.unread[channelId].mentionCount = mentionCount;
                        } else {
                            draft.unread[channelId] = {
                                lastRead: lastMessageId,
                                mentionCount,
                            };
                        }
                    })
                );
            },
        })
    )
);
