import { useMutation } from "react-query";
import { request } from "../../src/request";

export const editRole = async (
    guildId: string,
    roleId: string,
    data: Object
) => {
    console.log(data);
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/roles/${roleId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
            credentials: "include",
        }
    );
    return res.json();
};

export const useEditRole = (guildId: string, roleId: string) =>
    useMutation((data: Object) => editRole(guildId, roleId, data));
