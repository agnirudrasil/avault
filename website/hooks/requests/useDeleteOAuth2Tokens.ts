import { useMutation, useQueryClient } from "react-query";
import { request } from "../../src/request";

export const deleteOAuth2Tokens = async (id: string) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/oauth2/tokens/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.text();
};

export const useDeleteOAuth2Tokens = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation(["oauth2-tokens"], () => deleteOAuth2Tokens(id), {
        onSuccess: () => queryClient.invalidateQueries(["oauth2-tokens"]),
    });
};
