import { useQuery } from "react-query";
import { request } from "../../src/request";
import { GuildMembers } from "../../stores/useUserStore";

export const getMembers = async ({ queryKey }: { queryKey: string[] }) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${queryKey[1]}/members`,
        {
            credentials: "include",
        }
    );

    return data.json() as Promise<{
        has_more: boolean;
        members: GuildMembers[];
    }>;
};
export const useGetMembers = (guildId: string) =>
    useQuery(["members", guildId], getMembers, { staleTime: Infinity });
