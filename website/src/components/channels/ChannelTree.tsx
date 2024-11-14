import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { useRouter } from "next/router";
import React from "react";
import { useMemo, useState } from "react";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { Channel } from "../../../types/channels";
import { CategoryChannel } from "./channel-types/CategoryChannel";
import { TextChannel } from "./channel-types/TextChannel";
import { VoiceChannel } from "./channel-types/VoiceChannel";
import shallow from "zustand/shallow";

interface Node {
    self: Channel;
    children: Channel[];
}

const createHierarchy = (channels: Channel[]) => {
    if (!channels) return {};
    const hierarchy: Record<string, Node> = {};
    for (const channel of channels) {
        if (channel?.parent_id) {
            if (!hierarchy[channel.parent_id]) {
                hierarchy[channel.parent_id] = {
                    self: {} as Channel,
                    children: [],
                };
            }
            hierarchy[channel.parent_id].children.push(channel);
        } else {
            if (hierarchy[channel?.id]) {
                hierarchy[channel?.id].self = channel;
            } else {
                hierarchy[channel?.id] = { self: channel, children: [] };
            }
        }
    }
    return hierarchy;
};

export const ChannelTree: React.FC = () => {
    const router = useRouter();
    const { allChannels, hiddenChannels } = useChannelsStore(
        state => ({
            allChannels: state.channels[router.query.guild as string],
            hiddenChannels: state.hiddenChannels[router.query.guild as string],
        }),
        shallow
    );

    const channels = useMemo(() => {
        if (!allChannels) return {};
        return Object.keys(allChannels)
            .filter(channelId => !hiddenChannels?.includes(channelId))
            .reduce((acc, channelId) => {
                acc[channelId] = allChannels[channelId];
                return acc;
            }, {} as Record<string, Channel>);
    }, [allChannels, hiddenChannels]);

    const richObject = useMemo(
        () => createHierarchy(Object.values(channels ?? {})),
        [channels]
    );
    const [expanded, setExpanded] = useState<string[]>(Object.keys(richObject));
    const [selected] = useState<string>(router.query.channel as string);

    const handleToggle = (_: React.SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds);
    };

    return (
        <TreeView
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            expanded={expanded}
            defaultEndIcon={<div style={{ width: 24 }} />}
            onNodeToggle={handleToggle}
            sx={{
                m: 1,
                mr: "10px",
                overflowY: "hidden",
                "&:hover": {
                    overflowY: "scroll",
                    mr: 0,
                },
                "&::-webkit-scrollbar": {
                    width: "10px",
                },
                "&::-webkit-scrollbar-track": {
                    bgcolor: "grey.900",
                },
                "&::-webkit-scrollbar-thumb": {
                    border: "3px solid transparent",
                    bgcolor: "background.paper",
                },
            }}
            selected={selected}
        >
            {Object.keys(richObject).map(key =>
                richObject[key].children.length === 0 ? (
                    richObject[key].self.type ===
                    "guild_category".toUpperCase() ? (
                        <CategoryChannel
                            categories={Object.keys(richObject).filter(
                                k =>
                                    richObject[k].self.type ===
                                    "guild_category".toUpperCase()
                            )}
                            setExpanded={setExpanded}
                            expanded={expanded}
                            key={key}
                            nodeId={key}
                            channel={richObject[key].self}
                        />
                    ) : richObject[key].self.type ===
                      "guild_text".toUpperCase() ? (
                        <TextChannel
                            key={key}
                            nodeId={key}
                            channel={richObject[key].self}
                        />
                    ) : (
                        <VoiceChannel
                            key={key}
                            nodeId={key}
                            channel={richObject[key].self}
                        />
                    )
                ) : (
                    <CategoryChannel
                        categories={Object.keys(richObject).filter(
                            k =>
                                richObject[k].self.type ===
                                "guild_category".toUpperCase()
                        )}
                        setExpanded={setExpanded}
                        expanded={expanded}
                        channel={richObject[key].self}
                        nodeId={key}
                        key={key}
                        id={key}
                    >
                        {richObject[key].children.map(channel =>
                            channel.type === "guild_text".toUpperCase() ? (
                                <TextChannel
                                    nodeId={channel.id}
                                    key={channel.id}
                                    channel={channel}
                                />
                            ) : (
                                <VoiceChannel
                                    nodeId={channel.id}
                                    key={channel.id}
                                    channel={channel}
                                />
                            )
                        )}
                    </CategoryChannel>
                )
            )}
        </TreeView>
    );
};
