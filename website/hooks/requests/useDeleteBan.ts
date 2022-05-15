import { useMutation } from "react-query";
import { request } from "../../src/request";

export const deleteBan = async ({
    banId,
    guildId,
}: {
    guildId: string;
    banId: string;
}) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/bans/${banId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );
    return res.text();
};

export const useDeleteBan = () => {
    return useMutation(deleteBan);
};
