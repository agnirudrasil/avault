import { useQuery } from "react-query";
import { request } from "../../src/request";

export const getUser = async (id: string) => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetUser = (id: string) =>
    useQuery(id, () => getUser(id), {
        cacheTime: Infinity,
    });
