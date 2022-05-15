import { LoadingButton } from "@mui/lab";
import {
    Avatar,
    Typography,
    CardHeader,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    ListSubheader,
    Divider,
    ListItemAvatar,
    ListItemSecondaryAction,
    Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { GuildSettingsLayout } from "../../layouts/routes/GuildSettings";
import { groupBy } from "lodash";
import { DefaultProfilePic } from "../../DefaultProfilePic";
import { useCreateEmoji } from "../../../../hooks/requests/useCreateEmoji";
import { useDeleteEmoji } from "../../../../hooks/requests/useDeleteEmoji";

export const GuildSettingsEmoji = () => {
    const router = useRouter();
    const guild = useGuildsStore(
        state => state.guilds[router.query.guild as string]
    );
    const { mutate, isLoading, isError } = useCreateEmoji();
    const { mutateAsync, isLoading: loading } = useDeleteEmoji();

    return (
        <GuildSettingsLayout>
            <CardHeader
                title={<Typography variant="h6">Server Emoji</Typography>}
                subheader={
                    <Typography variant="body2" color="GrayText">
                        Add upto 50 custom emoji to your server. Emoji names
                        must be atleast 2 characters long. Emoji must be under
                        256KB in size.
                    </Typography>
                }
                action={
                    <label>
                        <input
                            type="file"
                            accept="image/*"
                            value=""
                            onChange={e => {
                                if (e.target.files?.[0]) {
                                    const reader = new FileReader();
                                    const name =
                                        e.target.files?.[0]?.name || "name";
                                    reader.onload = () => {
                                        mutate({
                                            id: guild.id,
                                            image: reader.result as string,
                                            name: name.split(".")[0],
                                        });
                                    };
                                    reader.readAsDataURL(e.target.files[0]);
                                }
                            }}
                            style={{ display: "none" }}
                        />
                        <LoadingButton
                            component="span"
                            loading={isLoading}
                            variant="contained"
                            disableElevation
                        >
                            Upload Emoji
                        </LoadingButton>
                    </label>
                }
            />
            {isError && (
                <Alert severity="error" variant="outlined">
                    Could not upload emoji.
                </Alert>
            )}
            {Object.entries(groupBy(guild.emojis, "animated")).map(group => (
                <List dense>
                    <ListSubheader>
                        {group[0] === "true" ? "ANIMATED " : ""}EMOJI -{" "}
                        {50 - group[1].length} SLOTS AVAILABLE
                    </ListSubheader>
                    <ListItem>
                        <ListItemIcon>
                            <Typography variant="caption" color="GrayText">
                                EMOJI
                            </Typography>
                        </ListItemIcon>
                        <ListItemAvatar>
                            <CardHeader
                                avatar={
                                    <Box
                                        sx={{
                                            width: "100%",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="GrayText"
                                        >
                                            UPLOADED BY
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="caption" color="GrayText">
                                    NAME
                                </Typography>
                            }
                        />
                    </ListItem>
                    {group[1].map(e => (
                        <>
                            <ListItem
                                secondaryAction={
                                    <ListItemSecondaryAction>
                                        <LoadingButton
                                            loading={loading}
                                            color="error"
                                            disableElevation
                                            variant="contained"
                                            size="small"
                                            onClick={async () =>
                                                await mutateAsync({
                                                    id: e.id,
                                                    guildId: guild.id,
                                                })
                                            }
                                        >
                                            Delete{" "}
                                        </LoadingButton>
                                    </ListItemSecondaryAction>
                                }
                                key={e.id}
                            >
                                <ListItemIcon>
                                    <img
                                        width={50}
                                        height="auto"
                                        src={`${process.env.NEXT_PUBLIC_CDN_URL}emojis/${e.id}`}
                                        alt={e.name}
                                    />
                                </ListItemIcon>
                                <ListItemAvatar>
                                    <CardHeader
                                        title={e.user.username}
                                        avatar={
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                }}
                                                src={`${process.env.NEXT_PUBLIC_CDN_URL}avatars/${e.user.id}/${e.user.avatar}`}
                                            >
                                                <DefaultProfilePic
                                                    width={32}
                                                    height={32}
                                                    tag={e.user.tag}
                                                />
                                            </Avatar>
                                        }
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1">
                                            <Typography
                                                component="span"
                                                color="GrayText"
                                            >
                                                :
                                            </Typography>{" "}
                                            {e.name}{" "}
                                            <Typography
                                                component="span"
                                                color="GrayText"
                                            >
                                                {" "}
                                                :
                                            </Typography>
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <Divider flexItem />
                        </>
                    ))}
                </List>
            ))}
        </GuildSettingsLayout>
    );
};
