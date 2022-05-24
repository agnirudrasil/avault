import { useQuery } from "react-query";
import { request } from "../../src/request";
import { Guild } from "../../stores/useGuildsStore";
import { User } from "../../stores/useUserStore";
import { Channel } from "../../types/channels";

export interface Invite {
    id: string;
    inviter: User;
    expires_at: string;
    count: number;
    max_uses: number;
    channel: Channel;
    guild?: Guild;
}

export const getInvite = async ({ queryKey }: { queryKey: string[] }) => {
    const [_, code] = queryKey;
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/invites/${code}`,
        {
            credentials: "include",
        }
    );
    if (!data.ok) {
        throw new Error(data.statusText);
    }
    return data.json() as Promise<Invite>;
};

export const useGetInvite = (code: string) =>
    useQuery(["invite", code], getInvite, {
        cacheTime: Infinity,
        staleTime: Infinity,
        retry: false,
    });
