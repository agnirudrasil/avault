import { useMutation } from "react-query";
import { request } from "../../src/request";

export const deleteChannel = async (channel: string) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channel}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    return res.json();
};

export const useDeleteChannel = (channel: string) =>
    useMutation(() => deleteChannel(channel));
