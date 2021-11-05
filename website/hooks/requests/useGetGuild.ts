import { useQuery } from "react-query";

export const getGuild = async ({ queryKey }) => {
    const [_, guildId] = queryKey;
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guild/${guildId}`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetGuild = (guildId: string) =>
    useQuery(["guild", guildId], getGuild);
