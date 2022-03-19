import { useMutation } from "react-query";
import { request } from "../../src/request";

export const editOtherNickname = async (
    guildId: string,
    { user, ...data }: { nick: string; user: string }
) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/members/${user}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
            credentials: "include",
        }
    );
    return res.json();
};

export const useUpdateOtherNickname = (guildId: string) =>
    useMutation((data: { nick: string; user: string }) =>
        editOtherNickname(guildId, data)
    );
