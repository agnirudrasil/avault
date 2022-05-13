import { useMutation } from "react-query";
import { request } from "../../src/request";
import { User, useUserStore } from "../../stores/useUserStore";

interface Data {
    username?: string;
    password?: string;
    new_password?: string;
    email?: string;
    avatar?: string;
    accent_color?: number;
    banner?: string;
    bio?: string;
}

export const updateUser = async (data: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me`,
        {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json() as Promise<User>;
};

export const useUpdateUser = () => {
    const updateUserStore = useUserStore(state => state.updateUser);
    return useMutation(updateUser, {
        onSuccess: data => {
            updateUserStore(data);
        },
    });
};
