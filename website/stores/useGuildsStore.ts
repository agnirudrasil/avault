import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { useChannelsStore } from "./useChannelsStore";
import { useRolesStore } from "./useRolesStore";

export const useGuildsStore = create(
    combine({ ...({} as Record<string, any>) }, set => ({
        setGuilds: (guilds: any[]) =>
            set(() => {
                const guildsMap: Record<string, any> = {};
                guilds.forEach(guild => {
                    guildsMap[guild.id] = guild;
                });
                return guildsMap;
            }),
        updateGuild: (guild: any) => {
            set(state =>
                produce(state, draft => {
                    draft[guild.id] = guild;
                })
            );
        },
        addGuilds: (guild: any) => {
            const addGuild = useChannelsStore.getState().addGuild;
            const addRoles = useRolesStore.getState().addGuild;
            addGuild(guild.id, guild.channels);
            addRoles(guild.id, guild.roles);
            return set(state =>
                produce(state, draft => {
                    draft[guild.id] = guild;
                })
            );
        },
        removeGuild: (guildId: string) =>
            set(state => {
                const deleteGuild = useChannelsStore.getState().deleteGuild;
                const deleteRoles = useRolesStore.getState().deleteGuild;
                deleteGuild(guildId);
                deleteRoles(guildId);
                return produce(state, draft => {
                    delete draft[guildId];
                });
            }),
    }))
);
