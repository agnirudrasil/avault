import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Payload {
    guildId: string;
    id: string;
    position: number;
}

export const updateRolePosition = async ({ guildId, ...payload }: Payload) => {
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${guildId}/roles`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        }
    );
};

export const useUpdateRolePosition = () => useMutation(updateRolePosition);
