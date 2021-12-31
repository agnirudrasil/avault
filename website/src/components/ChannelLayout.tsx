import { useRouter } from "next/router";
import { useMemo } from "react";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { Channel } from "../../types/channels";
import { CategoryChannel } from "./channels/CategoryChannel";
import { TextChannel } from "./channels/TextChannel";

const createHierarchy = (channels: Channel[]) => {
    if (!channels) return {};
    const hierarchy: Record<string, { self: any; children: Channel[] }> = {};
    for (const channel of channels) {
        if (channel?.parent_id) {
            if (!hierarchy[channel.parent_id]) {
                hierarchy[channel.parent_id] = { self: {}, children: [] };
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

export const ChannelLayout: React.FC = () => {
    const router = useRouter();
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const heirarchy = useMemo(() => createHierarchy(channels), [channels]);
    return (
        <>
            {Object.keys(heirarchy).map((key, index) =>
                heirarchy[key].children.length === 0 ? (
                    heirarchy[key].self.type ===
                    "guild_category".toUpperCase() ? (
                        <CategoryChannel
                            name={heirarchy[key].self.name}
                            key={key}
                            id={key}
                            index={index}
                        />
                    ) : (
                        <TextChannel
                            name={heirarchy[key].self.name}
                            key={key}
                            id={key}
                            index={index}
                            overwrites={heirarchy[key].self.overwrites}
                        />
                    )
                ) : (
                    <CategoryChannel
                        key={key}
                        id={key}
                        name={heirarchy[key].self.name}
                        index={index}
                    >
                        {heirarchy[key].children.map((channel, index) => (
                            <TextChannel
                                name={channel.name}
                                key={channel.id}
                                id={channel.id}
                                index={index}
                                overwrites={channel.overwrites}
                            />
                        ))}
                    </CategoryChannel>
                )
            )}
        </>
    );
};
