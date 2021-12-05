import { useQuery } from "react-query";
import { request } from "../../src/request";

export const permissions = async () => {
    const data = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/permissions`
    );

    return data.json();
};

export const useGetPermissions = () => useQuery("permissions", permissions);
