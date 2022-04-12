import {
    Avatar,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { DefaultProfilePic } from "../DefaultProfilePic";

export const MembarsBar: React.FC = () => {
    const router = useRouter();
    const members = useGuildsStore(
        state => state.guilds[router.query.guild as string]?.members
    );
    return (
        <List dense sx={{ minWidth: "240px", bgcolor: "grey.900", p: 1 }}>
            {Object.keys(members ?? {}).map(user_id => {
                const member = members[user_id];
                return (
                    <ListItemButton key={user_id} sx={{ borderRadius: 2 }}>
                        <ListItemAvatar>
                            <Avatar>
                                <DefaultProfilePic tag={member.user.tag} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography>
                                    {member.nick || member.user.username}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                );
            })}
        </List>
    );
};
