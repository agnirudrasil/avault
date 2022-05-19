import produce from "immer";
import { InfiniteData, QueryClient } from "react-query";
import { Messages } from "../../stores/useMessagesStore";
import { chunk, uniqWith } from "lodash";

export const addMessage = (queryClient: QueryClient, message: Messages) => {
    queryClient.setQueryData<InfiniteData<Messages[]>>(
        ["messages", message.channel_id],
        data => {
            if (!data) return { pages: [[data]], pageParams: 1 } as any;
            return produce(data, draft => {
                if ((message as any).confirmed) console.log(message.author);
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
