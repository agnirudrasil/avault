import { useQuery } from "react-query";
import { request } from "../../src/request";
import { GuildMembers } from "../../stores/useUserStore";

export const getRoleMembers = async ({ queryKey }: { queryKey: string[] }) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${queryKey[1]}/roles/${queryKey[2]}/members`
    );

    return data.json() as Promise<GuildMembers[]>;
};
export const useGetRoleMembers = (guildId: string, roleId: string) =>
    useQuery(["role-members", guildId, roleId], getRoleMembers);
