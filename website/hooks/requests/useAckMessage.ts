import { useMutation } from "react-query";
import { request } from "../../src/request";

export const ackMessage = ({
    channel,
    message,
}: {
    channel: string;
    message: string;
}) => {
    return request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channel}/messages/${message}/ack`,
        {
            method: "POST",
            credentials: "include",
        }
    );
};

export const useAckMessage = () => useMutation(ackMessage);
