import { useQuery } from "react-query";
import { request } from "../../src/request";

export const getGuilds = async () => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/guilds`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetGuilds = () => useQuery("guilds", getGuilds);
