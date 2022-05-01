import { useQuery, UseQueryOptions } from "react-query";
import { request } from "../../src/request";
import { Application } from "./useGetApplications";

export const getApplication = async ({ queryKey }: any) => {
    const [_, id] = queryKey;
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`
    );

    return res.json() as Promise<Application>;
};

export const useGetApplication = (
    id: string,
    options?: Omit<
        UseQueryOptions<Application, unknown, Application, string[]>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery(["applications", id], getApplication, options);
};
