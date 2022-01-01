import { useMutation } from "react-query";
import { request } from "../../src/request";

export const editSelfNickname = async (
    guildId: string,
    data: { nick: string }
) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/members/@me`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
            credentials: "include",
        }
    );
    return res.json();
};

export const useUpdateSelfNickname = (guildId: string) =>
    useMutation((data: { nick: string }) => editSelfNickname(guildId, data));
