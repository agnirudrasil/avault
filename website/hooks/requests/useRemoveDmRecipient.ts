import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Data {
    channelId: string;
    userId: string;
}

export const removeDMRecipient = async ({ channelId, userId }: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/recipients/${userId}`,
        { method: "DELETE" }
    );

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.text();
};

export const useRemoveDmRecipient = () => useMutation(removeDMRecipient);
