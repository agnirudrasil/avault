import { useMutation } from "react-query";
import { request } from "../../src/request";
import { Emoji } from "../../stores/useGuildsStore";

interface Data {
    id: string;
    name: string;
    image: string;
}
export const createEmoji = async ({ id, ...body }: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${id}/emojis`,
        {
            method: "POST",
            body: JSON.stringify(body),
            credentials: "include",
        }
    );
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json() as Promise<Emoji>;
};

export const useCreateEmoji = () => useMutation(createEmoji);
