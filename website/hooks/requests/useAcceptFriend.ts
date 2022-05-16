import { useMutation } from "react-query";
import { request } from "../../src/request";

export const acceptFriend = async (id: string) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/relationships/${id}`,
        {
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
