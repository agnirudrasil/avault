import { useMutation } from "react-query";
import { request } from "../../src/request";

export const unpinMessage = async (channelId: string, messageId: string) => {
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/pins/${messageId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );
};

export const useUnpinMessage = (channelId: string) =>
    useMutation(({ messageId }: any) => unpinMessage(channelId, messageId));
