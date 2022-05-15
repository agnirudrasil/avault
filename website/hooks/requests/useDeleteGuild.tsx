import { useMutation } from "react-query";
import { request } from "../../src/request";

export const deleteGuild = async (id: string) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/guilds/${id}`,
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

export const useDeleteGuild = () => useMutation(deleteGuild);
