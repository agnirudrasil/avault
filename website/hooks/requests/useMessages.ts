import { useInfiniteQuery } from "react-query";
import { request } from "../../src/request";

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
    useInfiniteQuery(["messages", channelId], messages, {
        cacheTime: Infinity,
        staleTime: Infinity,
    });
