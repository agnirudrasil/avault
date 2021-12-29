import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { messages } from "../hooks/requests/useMessages";
import { useUserStore } from "./useUserStore";

export interface Reactions {
    emoji: string;
    count: number;
    me: boolean;
}

export interface Author {
    id: string;
    tag: string;
    username: string;
    bot?: boolean;
}
export interface Messages {
    id: string;
    channel_id: string;
    guild_id?: string;
    author_id: string;
    content: string;
    timestamp: Date;
    edited_timestamp?: Date;
    tts: boolean;
    mention_everyone: boolean;
    mentions: boolean;
    mention_roles: boolean;
    mention_channels: boolean;
    embeds?: any[];
    attachments?: any[];
    reactions: Reactions[];
    author: Author;
    reply?: Messages;
}

export const useMessagesStore = create(
    combine(
        {
            ...({} as Record<string, Messages[]>),
        },
        (set, get) => ({
            getChannelMessages: async (channelId: string) => {
                if (!get()[channelId]) {
                    const data = await messages({ queryKey: ["", channelId] });
                    set(state =>
                        produce(state, draft => {
                            draft[channelId] = data;
                        })
                    );
                }
            },
            setMessages: (messages: Record<string, Messages[]>) =>
                set(() => messages),
            addMessage: (message: Messages) =>
                set(state =>
                    produce(state, draft => {
                        if (draft[message.channel_id]) {
                            draft[message.channel_id] = [
                                message,
                                ...draft[message.channel_id],
                            ];
                        }
                    })
                ),
            deleteBulkMessages: (data: {
                ids: string[];
                channel_id: string;
                guild_id?: string;
            }) =>
                set(state =>
                    produce(state, draft => {
                        const indices: number[] = [];
                        data.ids.forEach(id => {
                            const index = draft[data.channel_id].findIndex(
                                m => m.id === id
                            );
                            indices.push(index);
                        });
                        indices.forEach(i => {
                            draft[data.channel_id].splice(i, 1);
                        });
                    })
                ),
            messageReactionRemoveAll: (data: {
                channel_id: string;
                guild_id?: string;
                message_id: string;
            }) => {
                set(state =>
                    produce(state, draft => {
                        draft[data.channel_id].forEach(m => {
                            if (m.id === data.message_id) {
                                m.reactions = [];
                            }
                        });
                    })
                );
            },
            messageReactionRemove: (data: {
                channel_id: string;
                guild_id?: string;
                message_id: string;
                emoji: string;
                user_id: string;
            }) => {
                set(state =>
                    produce(state, draft => {
                        const index = draft[data.channel_id].findIndex(
                            m => m.id === data.message_id
                        );
                        if (index > -1) {
                            const reactionIndex = draft[data.channel_id][
                                index
                            ].reactions.findIndex(r => r.emoji === data.emoji);
                            if (reactionIndex > -1) {
                                const count =
                                    draft[data.channel_id][index].reactions[
                                        reactionIndex
                                    ].count;
                                if (count === 1) {
                                    draft[data.channel_id][
                                        index
                                    ].reactions.splice(reactionIndex, 1);
                                } else {
                                    draft[data.channel_id][index].reactions[
                                        reactionIndex
                                    ].count--;
                                    if (
                                        useUserStore
                                            .getState()
                                            .isUserMe(data.user_id)
                                    ) {
                                        draft[data.channel_id][index].reactions[
                                            reactionIndex
                                        ].me = false;
                                    }
                                }
                            }
                        }
                    })
                );
            },
            messageReactionRemoveEmoji: (data: {
                channel_id: string;
                guild_id?: string;
                message_id: string;
                emoji: string;
                user_id: string;
            }) => {
                set(state =>
                    produce(state, draft => {
                        const index = draft[data.channel_id].findIndex(
                            m => m.id === data.message_id
                        );
                        if (index !== -1) {
                            draft[data.channel_id][index].reactions = draft[
                                data.channel_id
                            ][index].reactions.filter(
                                r => r.emoji !== data.emoji
                            );
                        }
                    })
                );
            },
            messageReactionAdd: (data: {
                channel_id: string;
                guild_id?: string;
                message_id: string;
                emoji: string;
                user_id: string;
            }) =>
                set(state =>
                    produce(state, draft => {
                        const index = draft[data.channel_id].findIndex(
                            m => m.id === data.message_id
                        );
                        const reactionIndex = draft[data.channel_id][
                            index
                        ].reactions.findIndex(r => r.emoji === data.emoji);
                        if (reactionIndex === -1) {
                            draft[data.channel_id][index].reactions.push({
                                emoji: data.emoji,
                                count: 1,
                                me: useUserStore
                                    .getState()
                                    .isUserMe(data.user_id),
                            });
                        } else {
                            draft[data.channel_id][index].reactions[
                                reactionIndex
                            ].count++;
                            if (
                                !draft[data.channel_id][index].reactions[
                                    reactionIndex
                                ].me
                            ) {
                                draft[data.channel_id][index].reactions[
                                    reactionIndex
                                ].me = useUserStore
                                    .getState()
                                    .isUserMe(data.user_id);
                            }
                        }
                    })
                ),
            deleteMessage: (channelId: string, messageId: string) =>
                set(state =>
                    produce(state, draft => {
                        draft[channelId] = draft[channelId].filter(
                            message => message.id !== messageId
                        );
                    })
                ),
            updateMessage: (message: Messages) =>
                set(state =>
                    produce(state, draft => {
                        const index = draft[message.channel_id].findIndex(
                            m => m.id === message.id
                        );
                        draft[message.channel_id][index] = message;
                    })
                ),
        })
    )
);
