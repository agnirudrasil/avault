import { GitHub, Api } from "@mui/icons-material";
import { IconButton, List, ListSubheader } from "@mui/material";
import { useRouter } from "next/router";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useUserStore } from "../../../stores/useUserStore";
import { LightTooltip } from "../LightTooltip";
import { ChannelMember } from "./ChannelMember";

export const ChannelMembersBar = () => {
    const router = useRouter();
    const members = useChannelsStore(
        state => state.privateChannels[router.query.channel as string]
    );
    const user = useUserStore(state => state.user);
    return (
        <List
            subheader={
                <ListSubheader
                    sx={{ m: -1, mb: 2, p: 1, pl: "auto", bgcolor: "grey.800" }}
                >
                    <LightTooltip title="Source Code">
                        <IconButton
                            sx={{ ml: "63%" }}
                            href="https://github.com/agnirudrasil/avault"
                            target="_blank"
                        >
                            <GitHub />
                        </IconButton>
                    </LightTooltip>
                    <LightTooltip title="Developer Portal">
                        <IconButton
                            href="/developers/applications"
                            target="_blank"
                        >
                            <Api />
                        </IconButton>
                    </LightTooltip>
                </ListSubheader>
            }
            dense
            sx={{ minWidth: "240px", bgcolor: "grey.900", p: 1 }}
        >
            {members?.recipients.map(u => (
                <ChannelMember
                    ownerId={members?.owner_id! ?? ""}
                    owner={u.id === (members?.owner_id ?? "")}
                    key={u.id}
                    member={u}
                    channelId={members?.id ?? ""}
                />
            ))}

            <ChannelMember
                ownerId={members.owner_id!}
                owner={user.id === (members?.owner_id ?? "")}
                member={user}
                channelId={members?.id ?? ""}
            />
        </List>
    );
};
