import { List } from "@mui/material";
import { useRouter } from "next/router";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useUserStore } from "../../../stores/useUserStore";
import { ChannelMember } from "./ChannelMember";

export const ChannelMembersBar = () => {
    const router = useRouter();
    const members = useChannelsStore(
        state => state.privateChannels[router.query.channel as string]
    );
    const user = useUserStore(state => state.user);
    return (
        <List dense sx={{ minWidth: "240px", bgcolor: "grey.900", p: 1 }}>
            {members?.recipients.map(u => (
                <ChannelMember
                    owner={u.id === members.owner_id}
                    key={u.id}
                    member={u}
                />
            ))}

            <ChannelMember
                owner={user.id === members?.owner_id}
                member={user}
            />
        </List>
    );
};
