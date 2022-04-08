import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { Webhook } from "./useGetWebhook";

export const patchWebhook = async ({
    id,
    name,
}: {
    id: string;
    name: string;
}) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/webhooks/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify({ name, avatar: "" }),
            credentials: "include",
        }
    );
    return (await data.json()) as Webhook;
};

export const usePatchWebhook = () => {
    const queryClient = useQueryClient();
    return useMutation(patchWebhook, {
        onSuccess: webhook => {
            console.log(webhook.channel_id);
            queryClient.invalidateQueries(["webhooks", webhook.channel_id]);
        },
    });
};
