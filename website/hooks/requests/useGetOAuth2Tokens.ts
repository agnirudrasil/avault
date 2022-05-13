import { useQuery } from "react-query";
import { request } from "../../src/request";
import { Application } from "./useGetApplications";

export const getOAuth2Tokens = async () => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/oauth2/tokens`
    );
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json() as Promise<
        {
            application: Application;
            scopes: string[];
        }[]
    >;
};

export const useGetOAuth2Tokens = () =>
    useQuery(["oauth2-tokens"], getOAuth2Tokens, {
        cacheTime: Infinity,
    });
