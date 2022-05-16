import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Data {
    username: string;
    tag: string;
}

export const createFriend = async (data: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/relationships`,
        {
            method: "POST",
            body: JSON.stringify(data),
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.text();
};

export const useCreateFriend = () => useMutation(createFriend);
