import { QueryFunction, useInfiniteQuery } from "react-query";
import { request } from "../../src/request";
import { Messages } from "../../stores/useMessagesStore";

export const messages: QueryFunction<Messages[], string[]> = async ({
    queryKey,
    pageParam,
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${
            queryKey[1]
        }/messages?limit=50${pageParam ? `&before=${pageParam}` : ""}`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return data.json() as Promise<Messages[]>;
};

export const useMessages = (channelId: string) =>
    useInfiniteQuery(["messages", channelId], messages, {
        cacheTime: Infinity,
        staleTime: Infinity,
        getNextPageParam: previousPage => {
            return previousPage.length > 0
                ? previousPage[previousPage.length - 1]?.id
                : previousPage.length < 50
                ? null
                : null;
        },
    });
