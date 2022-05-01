import { useQuery, UseQueryOptions } from "react-query";
import { request } from "../../src/request";
import { User } from "../../stores/useUserStore";

export interface Application {
    id: string;
    name: string;
    description: string;
    bot: User;
    owner: User;
    redirect_uris: string[];
}

export const getApplications = async () => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/applications`
    );

    return res.json() as Promise<Application[]>;
};

export const useGetApplications = (
    options?: Omit<
        UseQueryOptions<Application[], unknown, Application[], string[]>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery(["applications"], getApplications, options);
};
