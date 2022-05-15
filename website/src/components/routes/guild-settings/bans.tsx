import {
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { GuildSettingsLayout } from "../../layouts/routes/GuildSettings";
import { useGetGuildBans } from "../../../../hooks/requests/useGetGuildBans";
import { DefaultProfilePic } from "../../DefaultProfilePic";
import { LoadingButton } from "@mui/lab";
import { useDeleteBan } from "../../../../hooks/requests/useDeleteBan";

export const GuildSettingsBans = () => {
    const router = useRouter();

    const { data } = useGetGuildBans(router.query.guild as string);
    const { mutateAsync, isLoading } = useDeleteBan();

    return (
        <GuildSettingsLayout>
            <Typography variant="h6">
                {data && data.length ? data.length : "No"} Bans
            </Typography>
            <List sx={{ mt: 3 }}>
                {data?.map(ban => (
                    <>
                        <ListItem
                            secondaryAction={
                                <ListItemSecondaryAction>
                                    <LoadingButton
                                        onClick={async () => {
                                            await mutateAsync({
                                                guildId: router.query
                                                    .guild as string,
                                                banId: ban.user.id,
                                            });
                                        }}
                                        loading={isLoading}
                                        variant="contained"
                                        color="error"
                                        disableElevation
                                        size="small"
                                    >
                                        Delete
                                    </LoadingButton>
                                </ListItemSecondaryAction>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar
                                    src={`${process.env.NEXT_PUBLIC_CDN_URL}avatars/${ban.user.id}/${ban.user.avatar}`}
                                >
                                    <DefaultProfilePic tag={ban.user.tag} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={ban.user.username + ban.user.tag}
                            />
                        </ListItem>
                        <Divider />
                    </>
                ))}
            </List>
        </GuildSettingsLayout>
    );
};
