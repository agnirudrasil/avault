import produce from "immer";
import { InfiniteData, QueryClient } from "react-query";
import { Messages } from "../../stores/useMessagesStore";
import { chunk, uniqWith } from "lodash";

export const addMessage = (queryClient: QueryClient, message: Messages) => {
    queryClient.setQueryData<InfiniteData<Messages[]>>(
        ["messages", message.channel_id],
        data => {
            if (!data) return { pages: [[message]], pageParams: [message.id] };
            return produce(data, draft => {
                const messages = draft.pages.flat();
                draft.pages = chunk(
                    uniqWith([message, ...messages], (x, y) => {
                        return x.nonce && y.nonce
                            ? x.nonce === y.nonce
                            : x.id === y.id;
                    }),
                    50
                );
            });
        }
    );
};

export const addMessageReaction = (
    queryClient: QueryClient,
    user: (id: string) => boolean,
    args: {
        channel_id: string;
        guild_id?: string;
        message_id: string;
        emoji: string;
        user_id: string;
    }
) => {
    queryClient.setQueryData<InfiniteData<Messages[]> | undefined>(
        ["messages", args.channel_id],
        data => {
            if (!data) return;
            return produce(data, draft => {
                const messages = draft.pages.flat();
                const messageIndex = messages.findIndex(
                    m => m.id === args.message_id
                );
                if (messageIndex < 0) return;
                const reactionIndex = messages[
                    messageIndex
                ].reactions.findIndex(r => r.emoji === args.emoji);
                if (reactionIndex < 0) {
                    messages[messageIndex].reactions.push({
                        emoji: args.emoji,
                        count: 1,
                        me: user(args.user_id),
                    });
                } else {
                    messages[messageIndex].reactions[reactionIndex].count++;
                    if (!messages[messageIndex].reactions[reactionIndex].me) {
                        messages[messageIndex].reactions[reactionIndex].me =
                            user(args.user_id);
                    }
                }
                draft.pages = chunk(messages, 50);
            });
        }
    );
};

export const removeAllMessageReactions = (
    queryClient: QueryClient,
    args: {
        channel_id: string;
        guild_id?: string;
        message_id: string;
        emoji: string;
        user_id: string;
    }
) => {
    queryClient.setQueryData<InfiniteData<Messages[]> | undefined>(
        ["messages", args.channel_id],
        data => {
            if (!data) return;
            return produce(data, draft => {
                const messages = draft.pages.flat();
                const messageIndex = messages.findIndex(
                    m => m.id === args.message_id
                );
                if (messageIndex < 0) return;
                messages[messageIndex].reactions = [];
                draft.pages = chunk(messages, 50);
            });
        }
    );
};

export const removeMessageReactionEmoji = (
    queryClient: QueryClient,
    args: {
        channel_id: string;
        guild_id?: string;
        message_id: string;
        emoji: string;
        user_id: string;
    }
) => {
    queryClient.setQueryData<InfiniteData<Messages[]> | undefined>(
        ["messages", args.channel_id],
        data => {
            if (!data) return;
            return produce(data, draft => {
                const messages = draft.pages.flat();
                const messageIndex = messages.findIndex(
                    m => m.id === args.message_id
                );
                if (messageIndex < 0) return;
                const reactionIndex = messages[
                    messageIndex
                ].reactions.findIndex(r => r.emoji === args.emoji);
                if (reactionIndex > -1) {
                    messages[messageIndex].reactions.splice(reactionIndex, 1);
                }
                draft.pages = chunk(messages, 50);
            });
        }
    );
};

export const updateMessagePin = (
    queryClient: QueryClient,
    args: {
        channel_id: string;
        message_id: string;
    }
) => {
    queryClient.setQueryData<InfiniteData<Messages[]> | undefined>(
        ["messages", args.channel_id],
        data => {
            if (!data) return;
            return produce(data, draft => {
                const messages = draft.pages.flat();
                const messageIndex = messages.findIndex(
                    m => m.id === args.message_id
                );
                if (messageIndex < 0) return;
                messages[messageIndex].pinned = !messages[messageIndex].pinned;
                draft.pages = chunk(messages, 50);
            });
        }
    );
};

export const removeMessageReaction = (
    queryClient: QueryClient,
    args: {
        channel_id: string;
        guild_id?: string;
        message_id: string;
        emoji: string;
        user_id: string;
    }
) => {
    queryClient.setQueryData<InfiniteData<Messages[]> | undefined>(
        ["messages", args.channel_id],
        data => {
            if (!data) return;
            return produce(data, draft => {
                const messages = draft.pages.flat();
                const messageIndex = messages.findIndex(
                    m => m.id === args.message_id
                );
                if (messageIndex < 0) return;
                const reactionIndex = messages[
                    messageIndex
                ].reactions.findIndex(r => r.emoji === args.emoji);
                if (reactionIndex < 0) {
                } else if (
                    messages[messageIndex].reactions[reactionIndex].count === 1
                ) {
                    messages[messageIndex].reactions.splice(reactionIndex, 1);
                } else {
                    messages[messageIndex].reactions[reactionIndex].count--;
                    if (messages[messageIndex].reactions[reactionIndex].me) {
                        messages[messageIndex].reactions[reactionIndex].me =
                            false;
                    }
                }
                draft.pages = chunk(messages, 50);
            });
        }
    );
};

export const deleteBulkMessages = (
    queryClient: QueryClient,
    args: {
        ids: string[];
        channel_id: string;
        guild_id?: string;
    }
) => {
    queryClient.setQueryData<InfiniteData<Messages[]> | undefined>(
        ["messages", args.channel_id],
        data => {
            if (!data) return;
            return produce(data, draft => {
                const messages = draft.pages.flat();
                const indices = messages
                    .map((m, i) => (args.ids.includes(m.id) ? i : null))
                    .filter(el => el != null);
                indices.forEach(i => {
                    messages.splice(i, 1);
                });
                draft.pages = chunk(messages, 50);
            });
        }
    );
};
