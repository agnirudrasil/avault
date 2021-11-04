import { useMutation } from "react-query";

export const register = async (credentials: any) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(credentials)) {
        form.append(key, value as string);
    }
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/auth/register`,
        {
            method: "POST",
            body: form,
        }
    );

    return response.json();
};

export const useRegister = () => {
    return useMutation(register);
};
