import { useMutation } from "react-query";
import { request } from "../../src/request";

export const createReaction = async ({
    channel_id,
    message_id,
    emoji,
}: {
    channel_id: string;
    message_id: string;
    emoji: string;
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channel_id}/message/${message_id}/reactions/${emoji}/@me`,
        {
            method: "PUT",
            credentials: "include",
        }
    );

    return data.json();
};

export const useCreateReaction = () => useMutation(createReaction);
