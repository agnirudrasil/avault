import { useMutation } from "react-query";
import { request } from "../../src/request";

export const editGuild = async ({
    guildId,
    name,
}: {
    guildId: string;
    name: string;
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}`,
        {
            method: "PATCH",
            body: JSON.stringify({ name }),
            credentials: "include",
        }
    );
    return data.json();
};

export const useEditGuild = () => useMutation(editGuild);
