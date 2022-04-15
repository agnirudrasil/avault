import produce from "immer";
import { InfiniteData, QueryClient } from "react-query";
import { Messages } from "../../stores/useMessagesStore";

export const addMessage = (
    queryClient: QueryClient,
    data: Messages,
    purge = false
) => {
    queryClient.setQueryData<InfiniteData<Messages[]>>(
        ["messages", data.channel_id],
        produce(draft => {
            if (draft) {
                const index = draft.pages[0].findIndex(m => m.id === data.id);
                if (index >= 0) {
                    draft.pages[0][index] = data;
                } else {
                    draft.pages[0] = [data, ...draft.pages[0].slice(0, 49)];
                }
                if (purge) {
                    draft.pages[0] = draft.pages[0].filter(
                        message => message.id
                    );
                }
            }
        })
    );
};
