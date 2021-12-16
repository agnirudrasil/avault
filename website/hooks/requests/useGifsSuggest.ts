import { useQuery } from "react-query";
import { request } from "../../src/request";

export const gifsSuggest = async ({ queryKey }: { queryKey: string[] }) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/gifs/suggest?q=${queryKey[0]}`
    );

    return data.json();
};

export const useGifsSuggest = (query: string) =>
    useQuery(query, gifsSuggest, { enabled: false });
