import Router from "next/router";
import { useMutation } from "react-query";
import { setAccessToken } from "../../src/access-token";

export const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/access-token`, {
        method: "POST",
        credentials: "include",
    });
    return "";
};

export const useLogout = () => {
    return useMutation(logout, {
        onSettled: () => {
            setAccessToken("");
            Router.replace("/login");
        },
    });
};
