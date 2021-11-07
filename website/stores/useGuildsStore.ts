import create from "zustand";
import { combine } from "zustand/middleware";
import { Channel } from "../types/Channel";

export const useGuildsStore = create(
    combine({ guilds: [] }, set => ({
        setGuilds: (guilds: any) => set(() => ({ guilds })),
    }))
);

export const useChannelsStore = create(
    combine(
        { channels: [] as Channel[], currentChannel: {} as Channel },
        set => ({
            setCurrentChannel: (currentChannel: Channel) =>
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
        })
    )
);
