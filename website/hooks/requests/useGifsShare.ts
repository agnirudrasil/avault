import { useMutation } from "react-query";
import { request } from "../../src/request";

export const gifsShare = async ({ id, search }: Record<string, string>) =>
    request(`${process.env.NEXT_PUBLIC_API_URL}/gifs/share`, {
        method: "POST",
        body: JSON.stringify({
            id,
            search_term: search,
        }),
        credentials: "include",
    });

export const useGifsShare = () => useMutation(gifsShare);
