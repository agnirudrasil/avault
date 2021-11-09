import create from "zustand";
import { combine } from "zustand/middleware";
import { useChannelsStore } from "./useGuildsStore";

export const useMessagesStore = create(
    combine(
        {
            messages: [] as any[],
        },
        set => ({
            setMessages: (messages: any[]) => set(() => ({ messages })),
            addMessage: (message: any) =>
                set(state => {
                    const currentChannel =
                        useChannelsStore.getState().currentChannel;
                    console.log(message.channel_id, currentChannel.id);
                    if (message.channel_id === currentChannel.id)
                        return {
                            messages:
                                state.messages.length < 50
                                    ? [message, ...state.messages]
                                    : [message, ...state.messages.slice(1)],
                        };
                    else return state;
                }),
        })
    )
);
