import { useMutation } from "react-query";
import { request } from "../../src/request";

export const resetToken = async (id: string) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/reset`,
        {
            method: "POST",
        }
    );
    return data.json() as Promise<{ token: string }>;
};

export const useResetToken = () => {
    return useMutation(resetToken);
};
