import { useQuery } from "react-query";
import { request } from "../../src/request";
import { User } from "../../stores/useUserStore";

export interface Webhook {
    id: string;
    type: number;
    guild_id?: string;
    channel_id: string;
    user: User;
    name: string;
    avatar?: string;
    token: string;
}

export const getWebhook = async ({ queryKey }: { queryKey: string[] }) => {
    const [_, id] = queryKey;
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${id}/webhooks`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return data.json() as Promise<Webhook[]>;
};

export const useGetWebhook = (channel_id: string) =>
    useQuery(["webhooks", channel_id], getWebhook, {
        staleTime: Infinity,
        cacheTime: Infinity,
    });
