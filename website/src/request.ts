import jwtDecode from "jwt-decode";
import { getAccessToken, setAccessToken } from "./access-token";

const refetchToken = async (): Promise<void> => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {
            credentials: "include",
            method: "POST",
        }
    );
    try {
        const data = await res.json();
        setAccessToken(data.access_token);
    } catch (e) {}
};

export const request = async (input: RequestInfo, init?: RequestInit) => {
    if (!getAccessToken()) {
        await refetchToken();
    } else {
        try {
            const { exp } = jwtDecode(getAccessToken()) as any;
            if (Date.now() > exp * 1000) {
                await refetchToken();
            }
        } catch {
            await refetchToken();
        }
    }
    return fetch(input, {
        credentials: "include",
        headers: {
            authorization: `Bearer ${getAccessToken()}`,
        },
        ...init,
    });
};
