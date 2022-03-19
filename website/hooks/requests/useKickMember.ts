import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Payload {
    guildId: string;
    memberId: string;
}

export const kickMember = (payload: Payload) => {
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${payload.guildId}/members/${payload.memberId}`,
        {
            method: "DELETE",
        }
    );
};

export const useKickMember = () => useMutation(kickMember);
