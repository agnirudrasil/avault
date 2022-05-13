import { useMutation } from "react-query";
import { setAccessToken } from "../../src/access-token";
import { request } from "../../src/request";
import { useUserStore } from "../../stores/useUserStore";

interface Data {
    code: string;
}

export const disableTOTP = async (data: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/totp/disable`,
        {
            method: "POST",
            body: JSON.stringify(data),
            credentials: "include",
        }
    );

    if (!response.ok) {
        console.log(response.status);
        throw new Error(response.statusText);
    }

    return response.json() as Promise<{
        access_token: string;
        detail?: string;
    }>;
};

export const useDisableTOTP = () => {
    const user = useUserStore(state => state.updateUser);
    return useMutation(disableTOTP, {
        onSuccess: ({ access_token }) => {
            if (access_token) {
                setAccessToken(access_token);
                user({ ...useUserStore.getState().user, mfa_enabled: false });
            }
        },
    });
};
