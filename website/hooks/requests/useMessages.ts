import { useQuery } from "react-query";
import { useMessagesStore } from "../../stores/useMessagesStore";

export const messages = async ({ queryKey }: { queryKey: string[] }) => {
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${queryKey[1]}`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return data.json();
};

export const useMessages = (channelId: string) =>
    useQuery(["messages", channelId], messages, {
        onSuccess: data => {
            useMessagesStore.getState().setMessages(data.messages);
        },
    });
