import { useMutation } from "react-query";
import { request } from "../../src/request";

export const createRole = async (guildId: string) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/roles`,
        {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({}),
        }
    );
    return data.json();
};

export const useCreateRoles = () => useMutation(createRole);
