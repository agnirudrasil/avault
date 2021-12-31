import { useMutation } from "react-query";
import { request } from "../../src/request";

export const createChannel = async (payload: any) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${payload.guild_id}/channels`,
        {
            method: "POST",
            body: JSON.stringify(payload),
            credentials: "include",
        }
    );
    return data.json();
};

export const useCreateChannel = () => useMutation(createChannel);
