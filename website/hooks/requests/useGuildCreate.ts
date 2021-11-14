import { useMutation } from "react-query";
import { request } from "../../src/request";

export const guildCreate = async (guild: FormData) => {
    const data = await request(`${process.env.NEXT_PUBLIC_API_URL}/guilds/`, {
        method: "POST",
        body: guild,
        credentials: "include",
    });
    return data.json();
};

export const useGuildCreate = () => {
    return useMutation(guildCreate);
};
