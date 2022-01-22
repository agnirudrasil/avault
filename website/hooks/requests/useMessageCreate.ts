import { useMutation } from "react-query";
import { request } from "../../src/request";

export const createMessage = async (channelId: string, content: any) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/messages`,
        {
            method: "POST",
            body: JSON.stringify({ ...content }),
            credentials: "include",
        }
    );
    return data.json();
};

export const useMessageCreate = (channelId: string) =>
    useMutation((content: any) => createMessage(channelId, content));
