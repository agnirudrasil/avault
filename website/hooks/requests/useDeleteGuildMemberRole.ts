import produce from "immer";
import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { GuildMembers } from "../../stores/useUserStore";

interface Params {
    guildMember: GuildMembers;
    roleId: string;
}

export const deleteGuildMemberRole = async ({
    guildMember,
    roleId,
}: Params) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildMember.guild_id}/members/${guildMember.user.id}/roles/${roleId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    return data.json();
};

export const useDeleteGuildMemberRole = () => {
    const queryClient = useQueryClient();

    return useMutation(deleteGuildMemberRole, {
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
                    if (draft) {
                        draft = draft.filter(
                            m => m.user.id !== variables.guildMember.user.id
                        );
                    }
                })
            );
        },
    });
};
