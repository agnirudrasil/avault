import create from "zustand";
import { combine } from "zustand/middleware";

export const useGuildsStore = create(
    combine({ guilds: [] as any[] }, set => ({
        setGuilds: (guilds: any) =>
            set(() => {
                console.log("guilds", guilds);
                return { guilds };
            }),
        addGuilds: (guild: any) =>
            set(({ guilds }) => ({ guilds: [...guilds, guild] })),
        removeGuild: (guildId: string) =>
            set(({ guilds }) => {
                return {
                    guilds: guilds.filter(g => g.id !== guildId),
                };
            }),
    }))
);

export const useChannelsStore = create(
    combine({ channels: [] as any, currentChannel: {} as any }, set => ({
        setCurrentChannel: (currentChannel: any) =>
            set(() => ({
                currentChannel: { ...currentChannel, unread: false },
            })),
        setChannels: (channels: any[]) =>
            set(() => ({
                channels: channels.map(channel => ({
                    ...channel,
                    unread: false,
                })),
            })),
    }))
);
