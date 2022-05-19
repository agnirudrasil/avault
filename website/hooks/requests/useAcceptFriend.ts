import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Data {
    id: string;
    type?: number;
}

export const acceptFriend = async ({ id, type }: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/relationships/${id}`,
        {
            body: JSON.stringify({
                type,
            }),
            method: "PUT",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.text();
};

export const useAcceptFriend = () => useMutation(acceptFriend);
