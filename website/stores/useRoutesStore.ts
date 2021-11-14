import create from "zustand";
import { combine } from "zustand/middleware";

export const useRoutesStore = create(
    combine({ route: "/" }, set => ({
        setRoute: (route: string) => set(() => ({ route })),
    }))
);
