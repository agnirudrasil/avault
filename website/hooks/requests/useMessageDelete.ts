import { useMutation } from "react-query";
import { request } from "../../src/request";

export const deleteMessage = async (channelId: string, messageId: string) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/messages/${messageId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    return data.json();
};

export const useDeleteMessage = (channelId: string) =>
    useMutation(({ messageId }: any) => deleteMessage(channelId, messageId));
