import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";

interface Data {
    id: string;
}

export const deleteApplication = async ({ id }: Data) => {
    return await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`,
        { method: "DELETE", credentials: "include" }
    );
};

export const useDeleteApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteApplication, {
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries(["applications", id]);
            queryClient.invalidateQueries(["applications"]);
        },
    });
};
