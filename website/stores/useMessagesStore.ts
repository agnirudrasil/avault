import create from "zustand";
import { combine } from "zustand/middleware";

export const useMessagesStore = create(
    combine(
        {
            messages: [] as any[],
        },
        set => ({
            setMessages: (messages: any[]) => set(() => ({ messages })),
            addMessage: (message: any) =>
                set(state => ({
                    messages:
                        state.messages.length < 50
                            ? [message, ...state.messages]
                            : [message, ...state.messages.slice(1)],
                })),
        })
    )
);
