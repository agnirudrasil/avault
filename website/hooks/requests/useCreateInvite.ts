import { useMutation } from "react-query";
import { request } from "../../src/request";
import { Invite } from "./useGetInvite";

type PostData = {
    max_uses: number;
    max_age: number;
};

export const createInvite = async ({
    body,
    channelId,
}: {
    channelId: string;
    body: PostData;
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/invites`,
        {
            credentials: "include",
            method: "POST",
            body: JSON.stringify(body),
        }
    );
    if (!data.ok) {
        throw new Error(data.statusText);
    }
    return data.json() as Promise<Invite>;
};

export const useCreateInvite = () =>
    useMutation<
        Invite,
        unknown,
        { channelId: string; body: PostData },
        unknown
    >(createInvite as any);
