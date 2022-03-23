import { useMutation } from "react-query";
import { request } from "../../src/request";

export const pinMessage = async (channelId: string, messageId: string) => {
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/pins/${messageId}`,
        {
            method: "PUT",
            credentials: "include",
        }
    );
};

export const usePinMessage = (channelId: string) =>
    useMutation(({ messageId }: any) => pinMessage(channelId, messageId));
