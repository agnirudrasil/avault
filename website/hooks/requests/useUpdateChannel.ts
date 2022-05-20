import { useMutation } from "react-query";
import { request } from "../../src/request";
import { Channel } from "../../types/channels";

interface Data {
    name?: string;
    topic?: string;
    parent_id?: string;
    icon?: string | null;
    owner_id?: string;
}

export const channelUpdate = async ({
    channelId,
    data,
}: {
    channelId: string;
    data: Data;
}) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}`,
        {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(data),
        }
    );

    return res.json() as Promise<Channel>;
};

export const useChannelUpdate = () => useMutation(channelUpdate);
