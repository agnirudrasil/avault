import produce from "immer";
import { InfiniteData, QueryClient } from "react-query";
import { Messages } from "../../stores/useMessagesStore";
import { chunk, uniqWith } from "lodash";

export const addMessage = (queryClient: QueryClient, data: Messages) => {
    queryClient.setQueryData<InfiniteData<Messages[]>>(
        ["messages", data.channel_id],
        produce(draft => {
            if (draft) {
                if ((data as any).confirmed) console.log(data.author);
                const messages = draft.pages.flat();
                draft.pages = chunk(
                    uniqWith([data, ...messages], (x, y) => {
                        return x.nonce && y.nonce
                            ? x.nonce === y.nonce
                            : x.id === y.id;
                    }),
                    50
                );
            }
        })
    );
};
