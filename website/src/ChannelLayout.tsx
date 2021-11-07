import { useMemo } from "react";
import { useChannelsStore } from "../stores/useGuildsStore";
import { CategoryChannel } from "./channels/CategoryChannel";
import { TextChannel } from "./channels/TextChannel";

const createHeirarchy = (channels: any[]) => {
    const heirarchy: Record<string, { self: any; children: any[] }> = {};
    for (const channel of channels) {
        if (channel.parent_id) {
            if (!heirarchy[channel.parent_id]) {
                heirarchy[channel.parent_id] = { self: {}, children: [] };
            }
            heirarchy[channel.parent_id].children.push(channel);
        } else {
            if (heirarchy[channel.id]) {
                heirarchy[channel.id].self = channel;
            } else {
                heirarchy[channel.id] = { self: channel, children: [] };
            }
        }
    }
    return heirarchy;
};

export const ChannelLayout: React.FC = () => {
    const channels = useChannelsStore(state => state.channels);
    const heirarchy = useMemo(() => createHeirarchy(channels), [channels]);
    return (
        <>
            {Object.keys(heirarchy).map(key =>
                heirarchy[key].children.length === 0 ? (
                    heirarchy[key].self.type ===
                    "guild_category".toUpperCase() ? (
                        <CategoryChannel
                            name={heirarchy[key].self.name}
                            key={key}
                            id={key}
                        />
                    ) : (
                        <TextChannel
                            name={heirarchy[key].self.name}
                            key={key}
                            id={key}
                        />
                    )
                ) : (
                    <CategoryChannel
                        key={key}
                        id={key}
                        name={heirarchy[key].self.name}
                    >
                        {heirarchy[key].children.map(channel => (
                            <TextChannel
                                name={channel.name}
                                key={channel.id}
                                id={channel.id}
                            />
                        ))}
                    </CategoryChannel>
                )
            )}
        </>
    );
};
