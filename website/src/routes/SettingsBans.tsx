import { Delete } from "@mui/icons-material";
import {
    Avatar,
    Box,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useDeleteBan } from "../../hooks/requests/useDeleteBan";
import { useGetGuildBans } from "../../hooks/requests/useGetGuildBans";
import { DefaultProfilePic } from "../components/DefaultProfilePic";
import { SettingsLayout } from "../components/layouts/SettingsLayout";

export const SettingsBans = () => {
    const router = useRouter();
    const { data } = useGetGuildBans(router.query.server_id as string);
    const { mutateAsync, isLoading } = useDeleteBan();
    return (
        <SettingsLayout>
            <Box
                sx={{ paddingTop: "60px", paddingLeft: "10px", width: "100%" }}
            >
                <Typography variant="h5">
                    {data && data.length ? data.length : "No"} Bans
                </Typography>
                <List>
                    {data &&
                        data.map(ban => (
                            <ListItem
                                secondaryAction={
                                    <IconButton
                                        disabled={isLoading}
                                        onClick={async () => {
                                            await mutateAsync({
                                                guildId: ban.guild_id,
                                                banId: ban.user.id,
                                            });
                                        }}
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <DefaultProfilePic tag={ban.user.tag} />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${ban.user.username}${ban.user.tag}`}
                                    secondary={ban.reason ?? ""}
                                />
                            </ListItem>
                        ))}
                </List>
            </Box>
        </SettingsLayout>
    );
};
