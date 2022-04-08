import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { Webhook } from "./useGetWebhook";

export const createWebhook = async ({
    id,
    name,
}: {
    id: string;
    name?: string;
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/${id}/webhooks`,
        {
            method: "POST",
            body: JSON.stringify({ name }),
            credentials: "include",
        }
    );
    return (await data.json()) as Webhook;
};

export const useCreateWebhook = () => {
    const queryClient = useQueryClient();
    return useMutation(createWebhook, {
        onSuccess: webhook => {
            console.log(webhook.channel_id);
            queryClient.invalidateQueries(["webhooks", webhook.channel_id]);
        },
    });
};
