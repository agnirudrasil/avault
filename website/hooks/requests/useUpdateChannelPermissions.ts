import { useMutation } from "react-query";
import { request } from "../../src/request";
import { Overwrites } from "../../types/channels";

export const updateChannelPermissions = async (
    channelId: string,
    overwrite: Overwrites
) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/permissions/${overwrite.id}`,
        {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify(overwrite),
        }
    );

    if (!res.ok) {
        throw new Error("Failed to update channel permissions");
    }
};

export const useUpdateChannelPermissions = (channelId: string) =>
    useMutation((overwrite: Overwrites) =>
        updateChannelPermissions(channelId, overwrite)
    );
