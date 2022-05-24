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
