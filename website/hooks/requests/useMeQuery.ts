import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { request } from "../../src/request";
import { User } from "../../stores/useUserStore";

export const meQuery = async () => {
    const res = await request(`${process.env.NEXT_PUBLIC_API_URL}/users/@me`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(`${res.status}`);
    }

    return res.json() as Promise<User>;
};

export const useMeQuery = () => {
    const router = useRouter();
    return useQuery(["me"], meQuery, {
        cacheTime: Infinity,
        staleTime: Infinity,
        onError: () => {
            router.replace(`/login?next=${router.asPath}`);
        },
    });
};
