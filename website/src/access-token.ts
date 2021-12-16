import { refetchToken } from "./request";
import jwtDecode from "jwt-decode";

let accessToken = "";

export const asyncGetAccessToken = async () => {
    if (!getAccessToken()) {
        return await refetchToken();
    } else {
        try {
            const { exp } = jwtDecode(getAccessToken()) as any;
            if (Date.now() > exp * 1000) {
                return await refetchToken();
            }
        } catch {
            return await refetchToken();
        }
    }

    return getAccessToken();
};

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
    accessToken = token;
};
