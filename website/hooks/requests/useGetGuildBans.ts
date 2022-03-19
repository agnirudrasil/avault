import { useQuery } from "react-query";
import { request } from "../../src/request";
import { User } from "../../stores/useUserStore";

interface Ban {
    user: User;
    reason?: string;
    guild_id: string;
}

export const getGuildBans = async ({ queryKey }: any) => {
    const [_, guildId] = queryKey;
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/bans`,
        {
            credentials: "include",
        }
    );
    return data.json() as Promise<Ban[]>;
};

export const useGetGuildBans = (guildId: string) =>
    useQuery(["guild-bans", guildId], getGuildBans, {
        cacheTime: Infinity,
    });
