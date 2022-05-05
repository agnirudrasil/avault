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
import { BotIndication } from "../BotIndication";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { StyledBadge } from "../StyledBadge";

export const MembarsBar: React.FC = () => {
    const router = useRouter();
    const members = useGuildsStore(
        state => state.guilds[router.query.guild as string]?.members
    );
    return (
        <List dense sx={{ minWidth: "240px", bgcolor: "grey.900", p: 1 }}>
            {Object.keys(members ?? {}).map(user_id => {
                const member = members[user_id];
                console.log(member);
                return (
                    <ListItemButton key={user_id} sx={{ borderRadius: 2 }}>
                        <ListItemAvatar>
                            <StyledBadge
                                borderColor={theme => theme.palette.grey[900]}
                                overlap="circular"
                                color="success"
                                badgeContent=""
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                            >
                                <Avatar>
                                    <DefaultProfilePic tag={member.user.tag} />
                                </Avatar>
                            </StyledBadge>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography>
                                    {member.nick || member.user.username}{" "}
                                    {member.user.bot && <BotIndication />}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                );
            })}
        </List>
    );
};
