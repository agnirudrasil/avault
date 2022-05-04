import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { request } from "../../src/request";
import { Guild } from "../../stores/useGuildsStore";
import { User } from "../../stores/useUserStore";
import { Application } from "./useGetApplications";

export const getAuthorize = async (data: any) => {
    const res = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorize/?` +
            new URLSearchParams(data)
    );
    if (!res.ok) throw new Error(`${res.status}: ${res.status}`);
    return res.json() as Promise<{
        application: Application;
        user: User;
        guilds?: (Guild & { permissions: string })[];
        authorized: boolean;
        redirect_uri: string;
    }>;
};

export const useGetAuthorize = (data: any) => {
    const router = useRouter();
    return useQuery(["oauth2"], () => getAuthorize(data), {
        staleTime: Infinity,
        cacheTime: Infinity,
        onError: (err: Error) => {
            console.log(err.message);
            if (err.message.startsWith("403")) {
                router.replace(
                    `/login?next=${encodeURIComponent(router.asPath)}`
                );
            }
        },
    });
};
