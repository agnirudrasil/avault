import { useQuery } from "react-query";
import { request } from "../../src/request";

export const getRole = async ({ queryKey }: any) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${queryKey[1]}/roles/${queryKey[2]}`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetRole = (guildId: string, roleId: string) =>
    useQuery(["roles", guildId, roleId], getRole, {
        cacheTime: Infinity,
    });
