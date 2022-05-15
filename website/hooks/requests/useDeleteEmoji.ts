import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Data {
    id: string;
    guildId: string;
}

export const deleteEmoji = async ({ id, guildId }: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/emojis/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return;
};

export const useDeleteEmoji = () => useMutation(deleteEmoji);
