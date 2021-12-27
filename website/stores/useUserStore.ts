import create from "zustand";
import { combine } from "zustand/middleware";

interface User {
    username: string;
    tag: string;
    email: string;
    id: string;
}

export const useUserStore = create(
    combine({ user: {} as User }, (set, get) => ({
        setUser: (user: User) => set(() => ({ user })),
        isUserMe: (id: string) => {
            const user = get().user;
            return user.id === id;
        },
    }))
);
