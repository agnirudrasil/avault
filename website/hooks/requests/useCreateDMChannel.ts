import { useMutation } from "react-query";
import { request } from "../../src/request";
import { Channel } from "../../types/channels";

interface Data {
    recipient_ids: string[];
}

export const createDMChannel = async (data: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/channels`,
        {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(data),
        }
    );

    return response.json() as Promise<Channel>;
};

export const useCreateDMChannel = () => useMutation(createDMChannel);
