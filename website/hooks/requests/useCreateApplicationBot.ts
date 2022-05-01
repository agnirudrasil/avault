import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { Application } from "./useGetApplications";

export const createApplicationBot = async (id: string) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/bot`,
        {
            method: "POST",
        }
    );
    return data.json() as Promise<Application>;
};

export const useCreateApplicationBot = () => {
    const queryClient = useQueryClient();
    return useMutation(createApplicationBot, {
        onSuccess: (_, id) => {
            queryClient.invalidateQueries(["applications"]);
            queryClient.invalidateQueries(["applications", id]);
        },
    });
};
