import jwtDecode from "jwt-decode";
import { getAccessToken, setAccessToken } from "./access-token";

export const refetchToken = async (
    onError?: () => {}
): Promise<string | undefined> => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {
            credentials: "include",
            method: "POST",
        }
    );
    if (res.status === 403) {
        if (onError) {
            onError();
        }
    }
    try {
        const data = await res.json();
        setAccessToken(data.access_token);
        return data.access_token;
    } catch (e) {
        if (onError) {
            console.error(e);
            onError();
        }
    }
};

export const request = async (
    input: RequestInfo,
    init?: RequestInit,
    onError?: () => {}
) => {
    if (!getAccessToken()) {
        await refetchToken(onError);
    } else {
        try {
            const { exp } = jwtDecode(getAccessToken()) as any;
            if (Date.now() > exp * 1000) {
                await refetchToken();
            }
        } catch {
            await refetchToken(onError);
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
