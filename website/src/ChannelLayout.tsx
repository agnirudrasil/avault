import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useMemo } from "react";
import { CategoryChannel } from "./channels/CategoryChannel";
import { TextChannel } from "./channels/TextChannel";

const createHeirarchy = (channels: any[]) => {
    const heirarchy: Record<string, { self: any; children: any[] }> = {};
    for (const channel of channels) {
        if (channel.parent_id !== "None") {
            if (!heirarchy[channel.parent_id]) {
                heirarchy[channel.parent_id] = { self: channel, children: [] };
            }
            heirarchy[channel.parent_id].children.push(channel);
        } else {
            heirarchy[channel.id] = { self: channel, children: [] };
        }
    }
    return heirarchy;
};

export const ChannelLayout: React.FC<{ channels: any[] }> = ({ channels }) => {
    const heirarchy = useMemo(() => createHeirarchy(channels), [channels]);
    return (
        <>
            {Object.keys(heirarchy).map(key =>
                heirarchy[key].children.length === 0 ? (
                    <ListItemButton key={key}>
                        <ListItemIcon>#</ListItemIcon>
                        <ListItemText primary={heirarchy[key].self.name} />
                    </ListItemButton>
                ) : (
                    <>
                        <CategoryChannel
                            key={key}
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
                    </>
                )
            )}
        </>
    );
};
