import { useMutation } from "react-query";
import { request } from "../../src/request";

export const deleteRole = async (guildId: string, roleId: string) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/roles/${roleId}`,
        {
            method: "DELETE",
            credentials: "include",
            body: "{}",
        }
    );
    return res.json();
};

export const useDeleteRole = (guildId: string, roleId: string) =>
    useMutation(() => deleteRole(guildId, roleId));
