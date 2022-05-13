import { useMutation } from "react-query";

interface Data {
    email: string;
    password: string;
    code?: string;
}

type Return = {
    access_token?: string;
    refresh_token?: string;
    mfa?: boolean;
    detail?: string;
};

export const login = async (credentials: Data) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
            method: "POST",
            body: JSON.stringify(credentials),
            credentials: "include",
        }
    );

    return response.json() as Promise<Return>;
};

export const useLogin = () => {
    return useMutation(login);
};
