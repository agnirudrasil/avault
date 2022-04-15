import { useMutation, useQueryClient } from "react-query";
import { addMessage } from "../../src/components/addMessage";
import { request } from "../../src/request";
import { Messages } from "../../stores/useMessagesStore";

interface Attachments {
    file: File;
    filename: string;
    description?: string;
    processing?: boolean;
}

interface MessageCreate {
    content?: string;
    attachments?: Attachments[];
    channelId: string;
}

export const createMessage = async ({
    channelId,
    content,
    attachments,
}: MessageCreate) => {
    let postData: FormData | string | null = null;

    if (attachments) {
        postData = new FormData();
        attachments.forEach(attachment => {
            (postData as FormData).append(
                "files",
                attachment.file,
                attachment.filename
            );
        });
        if (content) {
            const blob = new Blob([JSON.stringify({ content })], {
                type: "application/json",
            });

            postData?.append("payload_json", blob);
        }
    } else {
        postData = JSON.stringify({ content });
    }

    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${channelId}/messages`,
        {
            method: "POST",
            body: postData,
            credentials: "include",
        }
    );

    return data.json() as Promise<Messages>;
};

export const useMessageCreate = (channelId: string, user: any) => {
    const queryClient = useQueryClient();
    return useMutation((args: MessageCreate) => createMessage(args), {
        onMutate: args => {
            addMessage(queryClient, {
                ...args,
                channel_id: channelId,
                confirmed: true,
                author: user,
            } as any);
        },
        onSuccess: data => {
            addMessage(queryClient, data, true);
        },
    });
};
