import { useQuery } from "react-query";

export const getInvite = async ({ queryKey }: { queryKey: string[] }) => {
    const [_, code] = queryKey;
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invites/${code}`,
        {
            credentials: "include",
        }
    );
    return data.json();
};

export const useGetInvite = (code: string) =>
    useQuery(["invite", code], getInvite);
