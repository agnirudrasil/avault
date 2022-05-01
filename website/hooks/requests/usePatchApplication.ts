import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";
import { Application } from "./useGetApplications";

interface Data {
    id: string;
    name: string;
    description: string;
    redirect_uris: string[];
}

export const patchApplications = async ({ id, ...data }: Data) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
        { method: "PATCH", body: JSON.stringify(data), credentials: "include" }
    );

    return res.json() as Promise<Application>;
};

export const usePatchApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(patchApplications, {
        onSuccess: ({ id }) => {
            queryClient.invalidateQueries(["applications", id]);
            queryClient.invalidateQueries(["applications"]);
        },
    });
};
