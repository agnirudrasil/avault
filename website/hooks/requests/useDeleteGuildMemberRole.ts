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
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildMember.guild_id}/members/${guildMember.user.id}/roles/${roleId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );
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
                    const deletedIndex = draft?.findIndex(
                        member =>
                            member.user.id === variables.guildMember.user.id
                    );
                    if (deletedIndex !== -1) {
                        draft?.splice(deletedIndex, 1);
                    }
                })
            );
        },
    });
};
