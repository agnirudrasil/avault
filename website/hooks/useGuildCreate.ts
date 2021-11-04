import { useMutation } from "react-query";

export const guildCreate = async (guild: FormData) => {
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guild/create`,
        {
            method: "POST",
            body: guild,
            credentials: "include",
        }
    );
    return data.json();
};

export const useGuildCreate = () => {
    return useMutation(guildCreate);
};
