import { useMutation } from "react-query";
import { request } from "../../src/request";

export const deleteChannelPermissions = async (
    channelId: string,
    overwrite: string
) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/permissions/${overwrite}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    return res.json();
};

export const useDeleteChannelPermissions = (channelId: string) =>
    useMutation((overwrite: string) =>
        deleteChannelPermissions(channelId, overwrite)
    );
