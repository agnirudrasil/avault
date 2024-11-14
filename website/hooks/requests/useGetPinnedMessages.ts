import { useQuery } from "react-query";
import { request } from "../../src/request";
import { Messages } from "../../stores/useMessagesStore";

export const getPinnedMessages = async (channelId: string) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/pins`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    if (!res.ok)
        throw new Error("An error occurred while fetching pinned messages");
    return res.json() as Promise<Messages[] | null>;
};

export const useGetPinnedMessage = (channelId: string) =>
    useQuery(["pinned", channelId], () => getPinnedMessages(channelId), {
        staleTime: Infinity,
    });
