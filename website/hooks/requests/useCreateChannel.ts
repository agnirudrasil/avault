import { useMutation } from "react-query";

export const createChannel = async (payload: any) => {
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
        }
    );
    return data.json();
};

export const useCreateChannel = () => useMutation(createChannel);
