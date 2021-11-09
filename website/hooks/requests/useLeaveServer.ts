import { useMutation } from "react-query";

export const leaveServer = async (serverId: string) => {
    return fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/@me/guilds/${serverId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );
};

export const useLeaveServer = (onSettled: () => any) =>
    useMutation(leaveServer, { onSettled });
