import { useMutation } from "react-query";
import { request } from "../../src/request";

interface Payload {
    guildId: string;
    memberId: string;
}

export const banMember = (payload: Payload) => {
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${payload.guildId}/bans/${payload.memberId}`,
        {
            method: "PUT",
            body: JSON.stringify({ reason: "", delete_message_days: 0 }),
        }
    );
};

export const useBanMember = () => useMutation(banMember);
