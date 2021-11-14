import { useQuery } from "react-query";
import { request } from "../../src/request";

export const getGuild = async ({ queryKey }: any) => {
    const [_, guildId] = queryKey;
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetGuild = (guildId: string) =>
    useQuery(["guild", guildId], getGuild);
