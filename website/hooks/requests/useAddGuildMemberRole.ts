import produce from "immer";
import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { GuildMembers } from "../../stores/useUserStore";

interface Params {
    guildMember: GuildMembers;
    roleId: string;
}

export const addGuildMemberRole = async ({ guildMember, roleId }: Params) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildMember.guild_id}/members/${guildMember.user.id}/roles/${roleId}`,
        {
            method: "PUT",
            credentials: "include",
        }
    );

    return data.json();
};

export const useAddGuildMemberRole = () => {
    const queryClient = useQueryClient();

    return useMutation(addGuildMemberRole, {
        onSettled: (_, __, variables) => {
            const prevData = queryClient.getQueryData<GuildMembers[]>([
                "role-members",
                variables.guildMember.guild_id,
                variables.roleId,
            ]);
            queryClient.setQueryData(
                [
                    "role-members",
                    variables.guildMember.guild_id,
                    variables.roleId,
                ],
                produce(prevData, draft => {
                    draft?.push(variables.guildMember);
                })
            );
        },
    });
};
