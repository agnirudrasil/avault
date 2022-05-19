import { Add, Home } from "@mui/icons-material";
import { Avatar, Box, Divider, Grow, IconButton, Stack } from "@mui/material";
import Link from "next/link";
import router from "next/router";
import { Fragment, useCallback, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import shallow from "zustand/shallow";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { useFriendsStore } from "../../stores/useFriendsStore";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { Unread, useUserStore } from "../../stores/useUserStore";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { CreateServerDialog } from "./dialogs/CreateServerDialog";
import { GuildItem } from "./GuildItem";
import { LightTooltip } from "./LightTooltip";
import { StyledBadge } from "./StyledBadge";

const HomeButton: React.FC = () => {
    const friends = useFriendsStore(state => state.friends);
    const mentionCount = Object.keys(friends).filter(
        key => friends[key].type === 3
    ).length;

    return (
        <Link href={`/channels/@me`}>
            <Box onContextMenu={() => {}} sx={{ m: 1 }}>
                <StyledBadge
                    badgeContent={mentionCount}
                    color="error"
                    overlap="circular"
                    invisible={mentionCount === 0}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                >
                    <LightTooltip
                        placement="right"
                        title="Home"
                        disableInteractive
                    >
                        <Avatar
                            sx={{
                                bgcolor:
                                    router.query.guild === undefined
                                        ? "primary.dark"
                                        : "grey.900",
                                // m: 1,
                                color: "white",
                                borderRadius:
                                    router.query.guild === undefined ? 3 : 10,
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                                width: 48,
                                height: 48,
                                transition: "all 300ms ease",
                                "&:hover": {
                                    borderRadius: 3,
                                    bgcolor: "primary.dark",
                                },
                                position: "relative",
                                ":before": {
                                    content: "''",
                                    position: "absolute",
                                    width: "5px",
                                    height: 0,
                                    top: "50%",
                                    left: "-8px",
                                    bgcolor: "common.white",
                                    borderRadius: "0 20px 20px 0",
                                    transform: "translateY(-50%)",
                                    transition: "height 300ms",
                                },
                                ":hover::before": {
                                    height:
                                        router.query.guild === undefined
                                            ? "70%"
                                            : "50%",
                                },
                            }}
                        >
                            <Home />
                        </Avatar>
                    </LightTooltip>
                </StyledBadge>
            </Box>
        </Link>
    );
};

export const PrivateChannels: React.FC = () => {
    const channels = useChannelsStore(state => state.privateChannels);

    const unread = useUserStore(
        state =>
            Object.keys(state.unread)
                .filter(k => k in channels)
                .reduce((a, b) => {
                    a[b] = state.unread[b];
                    return a;
                }, {} as Record<string, Unread>),

        shallow
    );

    return (
        <TransitionGroup>
            {Object.keys(channels)
                .filter(k => Boolean(unread[k].mentionCount))
                .map(k => {
                    const channel = channels[k];
                    const u = unread[k];

                    return (
                        Boolean(u.mentionCount) && (
                            <Grow key={k} unmountOnExit mountOnEnter>
                                <Box onContextMenu={() => {}} sx={{ m: 1 }}>
                                    <StyledBadge
                                        badgeContent={u?.mentionCount ?? ""}
                                        color="error"
                                        overlap="circular"
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "right",
                                        }}
                                    >
                                        <Link href={`/channels/@me/${k}`}>
                                            <Avatar
                                                src={
                                                    channel.recipients[0].avatar
                                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${channel.recipients[0].id}/${channel.recipients[0].avatar}`
                                                        : undefined
                                                }
                                                sx={{
                                                    cursor: "pointer",
                                                    width: 48,
                                                    height: 48,
                                                }}
                                            >
                                                <DefaultProfilePic
                                                    width={48}
                                                    height={48}
                                                    tag={
                                                        channel.recipients[0]
                                                            .tag
                                                    }
                                                />
                                            </Avatar>
                                        </Link>
                                    </StyledBadge>
                                </Box>
                            </Grow>
                        )
                    );
                })}
        </TransitionGroup>
    );
};

export const ServerBar: React.FC = () => {
    const guildPreview = useGuildsStore(state => state.guildPreview);
    const [open, setOpen] = useState<boolean>(false);
    const onClose = useCallback(() => setOpen(false), [open]);
    const onOpen = useCallback(() => setOpen(true), [open]);
    return (
        <Stack
            alignItems="center"
            sx={{
                height: "100%",
                borderRight: "1px solid",
                borderColor: "grey.900",
            }}
        >
            <HomeButton />
            <PrivateChannels />
            <Divider flexItem />
            {Object.keys(guildPreview).map((guild, index, array) => (
                <Fragment key={guild}>
                    <GuildItem guild={guildPreview[guild]} key={guild} />
                    {index === array.length - 1 && (
                        <Divider key={`divider-${guild}`} flexItem />
                    )}
                </Fragment>
            ))}
            <IconButton onClick={onOpen} sx={{ m: 2 }}>
                <Add />
            </IconButton>
            <CreateServerDialog open={open} onClose={onClose} />
        </Stack>
    );
};
