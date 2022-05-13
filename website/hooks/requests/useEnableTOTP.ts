import { useMutation } from "react-query";
import { setAccessToken } from "../../src/access-token";
import { request } from "../../src/request";
import { useUserStore } from "../../stores/useUserStore";

interface Data {
    secret: string;
    password: string;
    code: string;
}

export const enableTOTP = async (data: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/totp/enable`,
        {
            method: "POST",
            body: JSON.stringify(data),
            credentials: "include",
        }
    );
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json() as Promise<{
        access_token: string;
        backup_codes: { code: string; user_id: string; consumed: boolean }[];
    }>;
};

export const useEnableTOTP = () => {
    const user = useUserStore(state => state.updateUser);
    return useMutation(enableTOTP, {
        onSuccess: ({ access_token }) => {
            setAccessToken(access_token);
            user({ ...useUserStore.getState().user, mfa_enabled: true });
        },
    });
};
