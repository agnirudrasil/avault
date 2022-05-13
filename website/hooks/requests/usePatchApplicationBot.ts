import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { Application } from "./useGetApplications";

interface Data {
    id: string;
    username: string;
    avatar?: string | null;
}

export const patchApplicationBot = async ({ id, ...data }: Data) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/bot`,
        { method: "PATCH", body: JSON.stringify(data), credentials: "include" }
    );

    return res.json() as Promise<Application>;
};

export const usePatchApplicationBot = () => {
    const queryClient = useQueryClient();
    return useMutation(patchApplicationBot, {
        onSuccess: ({ id }) => {
            queryClient.invalidateQueries(["applications", id]);
            queryClient.invalidateQueries(["applications"]);
        },
    });
};
