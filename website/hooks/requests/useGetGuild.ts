import { useQuery } from "react-query";
import { useChannelsStore } from "../../stores/useGuildsStore";

export const getGuild = async ({ queryKey }: any) => {
    const [_, guildId] = queryKey;
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetGuild = (guildId: string) =>
    useQuery(["guild", guildId], getGuild, {
        onSuccess: data => {
            useChannelsStore.getState().setChannels(data.guild.channels);
        },
    });
