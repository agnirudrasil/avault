import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { ChannelStore, Channel, ChannelTypes } from "../types/channels";

export const useChannelsStore = create(
    combine({ ...({ privateChannels: [] } as ChannelStore) }, (set, get) => ({
        deleteGuild: (guildId: string) => {
            set(state =>
                produce(state, draft => {
                    delete draft[guildId];
                })
            );
        },
        getFirstGuildChannel: (guildId: string) => {
            const channels = get()[guildId];
            if (channels) {
                return channels.find(c => c.type === ChannelTypes.guild_text);
            }
        },
        updateChannel: (channel: Channel) =>
            set(state => {
                return produce(state, draft => {
                    const channelId = channel.id;
                    const guildId = channel.guild_id;
                    if (guildId) {
                        const index = draft[guildId].findIndex(
                            channel => channel.id === channelId
                        );
                        draft[guildId][index] = channel;
                    } else {
                        const index = draft.privateChannels.findIndex(
                            channel => channel.id === channelId
                        );
                        draft.privateChannels[index] = channel;
                    }
                });
            }),
        updateLastRead: (guild: string, channel: string, message: string) => {
            set(state =>
                produce(state, draft => {
                    const index = draft[guild].findIndex(c => c.id === channel);
                    draft[guild][index].last_read = message;
                })
            );
        },
        updateLastMessage: (
            guild: string,
            channel: string,
            message: string
        ) => {
            set(state =>
                produce(state, draft => {
                    const index = draft[guild].findIndex(c => c.id === channel);
                    draft[guild][index].last_message_id = message;
                })
            );
        },
        addGuild: (guild: string, channels: Channel[]) => {
            set(state =>
                produce(state, draft => {
                    draft[guild] = channels;
                })
            );
        },
        deleteChannel: (channel_id: string, guildId?: string) => {
            set(state =>
                produce(state, draft => {
                    if (guildId) {
                        if (draft[guildId]) {
                            draft[guildId] = draft[guildId].filter(
                                c => c.id !== channel_id
                            );
                        }
                    } else {
                        draft.privateChannels = draft.privateChannels.filter(
                            c => c.id !== channel_id
                        );
                    }
                })
            );
        },
        addChannel: (channel: Channel) => {
            set(state =>
                produce(state, draft => {
                    const guildId = channel.guild_id;
                    if (guildId) {
                        if (!draft[guildId]) {
                            draft[guildId] = [];
                        }
                        draft[guildId].push(channel);
                    } else {
                        draft.privateChannels.push(channel);
                    }
                })
            );
        },
        setChannels: (channels: ChannelStore) =>
            set(() => ({
                ...channels,
            })),
    }))
);
