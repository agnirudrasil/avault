import { useMutation } from "react-query";
import { request } from "../../src/request";

export const editMessage = async (
    channelId: string,
    messageId: string,
    content: string,
    embeds: any[]
) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/messages/${messageId}`,
        {
            body: JSON.stringify({ content, embeds }),
            method: "PATCH",
            credentials: "include",
        }
    );

    return data.json();
};

export const useEditMessage = (channelId: string) =>
    useMutation(({ messageId, content, embeds }: any) => {
        return editMessage(channelId, messageId, content, embeds);
    });
