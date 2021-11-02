import { useMutation } from "react-query";

export const login = async (credentials: any) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(credentials)) {
        form.append(key, value as string);
    }
    const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        body: form,
        credentials: "include",
    });

    return response.json();
};

export const useLogin = () => {
    return useMutation(login);
};
