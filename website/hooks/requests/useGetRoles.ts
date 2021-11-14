import { useQuery } from "react-query";
import { request } from "../../src/request";

export const getRoles = async ({ queryKey }: any) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${queryKey[1]}/roles`,
        {
            method: "GET",
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetRoles = (guildId: string) =>
    useQuery(["roles", guildId], getRoles, {
        cacheTime: Infinity,
    });
