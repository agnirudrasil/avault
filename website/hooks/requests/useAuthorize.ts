import { useMutation } from "react-query";
import { removeEmpty } from "../../src/remove-empty";
import { request } from "../../src/request";

interface Data {
    data: any;
    guild_id?: string | null;
    permissions?: string;
    authorized?: boolean;
}

export const authorize = async ({ data, ...rest }: Data) => {
    const response = await request(
        `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorize?` +
            new URLSearchParams(removeEmpty(data)),
        {
            method: "POST",
            body: JSON.stringify(rest),
            credentials: "include",
        }
    );
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<{ location: string }>;
};

export const useAuthorizeMutation = () =>
    useMutation(authorize, {
        onSuccess: ({ location }) => {
            window.location.href = location;
        },
    });
