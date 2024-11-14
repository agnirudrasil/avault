import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { ChannelStore, Channel, ChannelTypes } from "../types/channels";

export const useChannelsStore = create(
    combine(
        {
            ...({
                privateChannels: {},
                channels: {},
                hiddenChannels: {},
            } as ChannelStore),
        },
        (set, get) => ({
            deleteGuild: (guildId: string) => {
                set(state =>
                    produce(state, draft => {
                        delete draft.channels[guildId];
                    })
                );
            },
            getFirstGuildChannel: (guildId: string) => {
                const channels = get().channels[guildId];
                if (channels) {
                    return channels[
                        Object.keys(channels).find(
                            c =>
                                channels[c].type === ChannelTypes.guild_text &&
                                !channels[c].overwrites.find(
                                    o =>
                                        o.id === guildId &&
                                        (BigInt(o.deny) & BigInt(1024)) ===
                                            BigInt(1024)
                                )
                        ) || ""
                    ];
                }
            },
            updateChannel: (channel: Channel) =>
                set(state => {
                    return produce(state, draft => {
                        const channelId = channel.id;
                        const guildId = channel.guild_id;
                        if (guildId) {
                            draft.channels[guildId][channelId] = channel;
                        } else {
                            draft.privateChannels[channel.id] = channel;
                        }
                    });
                }),
            updateLastRead: (
                guild: string,
                channel: string,
                message: string
            ) => {
                set(state =>
                    produce(state, draft => {
                        draft.channels[guild][channel].last_read = message;
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
                        draft.channels[guild][channel].last_message_id =
                            message;
                    })
                );
            },
            addGuild: (guild: string, channels: Channel[]) => {
                set(state =>
                    produce(state, draft => {
                        draft.channels[guild] = channels.reduce(
                            (p, c) => (
                                (p[c.id as keyof typeof p] =
                                    c as unknown as never),
                                p
                            ),
                            {}
                        );
                    })
                );
            },
            deleteChannel: (channel_id: string, guildId?: string) => {
                set(state =>
                    produce(state, draft => {
                        if (guildId) {
                            delete draft.channels[guildId][channel_id];
                        } else {
                            delete draft.privateChannels[channel_id];
                        }
                    })
                );
            },
            hideChannel: (channel_id: string, guildId: string) => {
                set(state =>
                    produce(state, draft => {
                        if (
                            !draft.hiddenChannels[guildId]?.includes(channel_id)
                        ) {
                            draft.hiddenChannels[guildId] = [
                                ...(draft.hiddenChannels[guildId] || []),
                                channel_id,
                            ];
                        }
                        localStorage.setItem(
                            "hiddenChannels",
                            JSON.stringify(draft.hiddenChannels)
                        );
                    })
                );
            },
            unhideChannel: (channel_id: string, guildId: string) => {
                set(state =>
                    produce(state, draft => {
                        if (
                            draft.hiddenChannels[guildId]?.includes(channel_id)
                        ) {
                            draft.hiddenChannels[guildId] =
                                draft.hiddenChannels[guildId].filter(
                                    c => c !== channel_id
                                );
                        }

                        localStorage.setItem(
                            "hiddenChannels",
                            JSON.stringify(draft.hiddenChannels)
                        );
                    })
                );
            },
            addChannel: (channel: Channel) => {
                set(state =>
                    produce(state, draft => {
                        const guildId = channel.guild_id;
                        if (guildId) {
                            draft.channels[guildId][channel.id] = channel;
                        } else {
                            draft.privateChannels[channel.id] = channel;
                        }
                    })
                );
            },
            setChannels: (channels: ChannelStore) =>
                set(() => ({
                    ...channels,
                })),
        })
    )
);
