import { useMutation } from "react-query";
import { request } from "../../src/request";
interface Data {
    name: string;
    icon?: string | null;
}

export const guildCreate = async (guild: Data) => {
    const data = await request(`${process.env.NEXT_PUBLIC_API_URL}/guilds/`, {
        method: "POST",
        body: JSON.stringify(guild),
        credentials: "include",
    });
    return data.json();
};

export const useGuildCreate = () => {
    return useMutation(guildCreate);
};
