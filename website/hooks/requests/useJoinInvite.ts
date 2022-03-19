import { useMutation } from "react-query";
import { request } from "../../src/request";

export const joinInvite = async ({
    code,
    onError,
}: {
    code: string;
    onError: () => {};
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/join/${code}`,
        {
            credentials: "include",
            method: "POST",
        },
        onError
    );
    return data.json();
};

export const useJoinInvite = () => useMutation(joinInvite);
