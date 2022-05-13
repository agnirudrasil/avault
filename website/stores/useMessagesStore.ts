import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { User, useUserStore } from "./useUserStore";

export interface Reactions {
    emoji: string;
    count: number;
    me: boolean;
}

export interface Messages {
    id: string;
    channel_id: string;
    guild_id?: string;
    author_id: string;
    content: string;
    timestamp: Date;
    type: number;
    edited_timestamp?: Date;
    tts: boolean;
    mention_everyone: boolean;
    mention: string[];
    mention_roles: string[];
    mention_channels: string[];
    embeds?: any[];
    attachments?: any[];
    reactions: Reactions[];
    author: User;
    reply?: Messages;
    pinned: boolean;
    nonce?: string;
}

export const useMessagesStore = create(
    combine(
        {
            ...({} as Record<string, Messages[]>),
        },
        set => ({
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
                        useUserStore
                            .getState()
                            .updateLastMessage(message.channel_id, {
                                lastMessageId: message.id,
                                lastMessageTimestamp: message.timestamp,
                            });
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
                        const index = draft[channelId].findIndex(
                            message => message.reply?.id === messageId
                        );
                        if (index >= 0) {
                            draft[channelId][index].reply = undefined;
                        }
                    })
                ),
            updateMessage: (message: Messages) =>
                set(state =>
                    produce(state, draft => {
                        const index = draft[message.channel_id]?.findIndex(
                            m => m.id === message.id
                        );
                        if (index && index !== -1) {
                            draft[message.channel_id][index] = message;
                        }
                    })
                ),
        })
    )
);
