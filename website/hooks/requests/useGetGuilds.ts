import { useQuery } from "react-query";

export const getGuilds = async () => {
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/guilds`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetGuilds = () => useQuery("guilds", getGuilds);
