import { useQuery } from "react-query";
import { request } from "../../src/request";

export const getReaction = async ({ queryKey }: any) => {
    const [_, channel, message, reaction] = queryKey;
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channel}/message/${message}/reactions/${reaction}?limit=50`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetReactions = (
    channel: string,
    message: string,
    reaction: string
) =>
    useQuery(["reactions", channel, message, reaction], getReaction, {
        cacheTime: Infinity,
    });
