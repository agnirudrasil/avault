import { useMutation } from "react-query";
import { request } from "../../src/request";

export const resetBotToken = async (id: string) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/bot/reset`,
        {
            method: "POST",
        }
    );
    return data.json() as Promise<{ token: string }>;
};

export const useResetBotToken = () => {
    return useMutation(resetBotToken);
};
