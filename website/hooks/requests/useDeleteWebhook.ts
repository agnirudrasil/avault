import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";

export const deleteWebhook = async ({
    id,
}: {
    id: string;
    channel_id: string;
}) => {
    await request(`${process.env.NEXT_PUBLIC_API_URL}/webhooks/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return;
};

export const useDeleteWebhook = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteWebhook, {
        onSuccess: (_, { channel_id }) => {
            queryClient.invalidateQueries(["webhooks", channel_id]);
        },
    });
};
