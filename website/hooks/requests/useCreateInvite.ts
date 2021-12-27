import {useMutation} from "react-query";
import {request} from "../../src/request";

type PostData = {
    max_uses: number;
    max_age: number;
};

export const createInvite = async ({body, channelId}: {
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
    return data.json();
};

export const useCreateInvite = () => useMutation(createInvite as any);
