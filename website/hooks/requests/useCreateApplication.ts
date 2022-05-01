import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { Application } from "./useGetApplications";

export const createApplication = async ({ name }: { name: string }) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications`,
        {
            method: "POST",
            body: JSON.stringify({ name }),
            credentials: "include",
        }
    );
    return data.json() as Promise<Application>;
};

export const useCreateApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(createApplication, {
        onSuccess: () => {
            queryClient.invalidateQueries(["applications"]);
        },
    });
};
