import { useQuery } from "react-query";
import { request } from "../../src/request";
import { useMessagesStore } from "../../stores/useMessagesStore";

export const messages = async ({ queryKey }: { queryKey: string[] }) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${queryKey[1]}/messages?limit=50`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return data.json();
};

export const useMessages = (channelId: string) =>
    useQuery(["messages", channelId], messages, {
        cacheTime: Infinity,
        onSettled: data => {
            useMessagesStore.setState({ channel_id: data });
        },
    });
