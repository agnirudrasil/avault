import { Home } from "@mui/icons-material";
import { Box, Typography, Avatar } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import shallow from "zustand/shallow";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { GuildPreview } from "../../stores/useGuildsStore";
import { useUserStore } from "../../stores/useUserStore";
import { getGuildInitials } from "../get-guild-intials";
import { hasUnread } from "../has-unread";
import { GuildItemContextMenu } from "./context-menus";
import { LightTooltip } from "./LightTooltip";
import { StyledBadge } from "./StyledBadge";

interface Props {
    guild?: GuildPreview;
}

export const GuildItem: React.FC<Props> = ({ guild }) => {
    const router = useRouter();

    const channels = useChannelsStore(state => state.channels[guild?.id || ""]);

    const unread = useUserStore(
        state => Object.keys(channels || {}).map(key => state.unread[key]),
        shallow
    );

    const { handleContextMenu, ...props } = useContextMenu();

    const mentionCount = useMemo(
        () => unread.reduce((acc, curr) => acc + (curr?.mentionCount ?? 0), 0),
        [unread]
    );

    const isGuildUnread = useMemo(
        () => unread?.some(u => hasUnread(u?.lastRead, u?.lastMessageId)),
        [unread]
    );

    const lastChannel = localStorage.getItem(`last-${guild?.id || ""}`);

    return (
        <Link
            href={`/channels/${guild ? guild.id : "@me"}/${lastChannel ?? ""}`}
            passHref
        >
            <Box onContextMenu={handleContextMenu} sx={{ m: 1 }}>
                <GuildItemContextMenu
                    guild={guild?.id || ""}
                    isUnread={isGuildUnread || Boolean(mentionCount)}
                    {...props}
                />
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
                        title={guild?.name || "Home"}
                        disableInteractive
                    >
                        <Avatar
                            sx={{
                                bgcolor: guild?.icon
                                    ? "transparent"
                                    : router.query.guild === guild?.id
                                    ? "primary.dark"
                                    : "grey.900",
                                // m: 1,
                                backgroundImage: guild?.icon
                                    ? `url(${process.env.NEXT_PUBLIC_CDN_URL}icons/${guild.id}/${guild.icon})`
                                    : undefined,
                                backgroundSize: "cover",
                                color: "white",
                                borderRadius:
                                    router.query.guild === guild?.id ? 3 : 10,
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                                width: 48,
                                height: 48,
                                transition: "all 300ms ease",
                                "&:hover": {
                                    borderRadius: 3,
                                    bgcolor: guild?.icon
                                        ? "transparent"
                                        : "primary.dark",
                                },
                                position: "relative",
                                ":before": {
                                    content: "''",
                                    position: "absolute",
                                    width: "5px",
                                    height:
                                        router.query.guild === guild?.id
                                            ? "70%"
                                            : isGuildUnread || mentionCount
                                            ? "20%"
                                            : 0,
                                    top: "50%",
                                    left: "-8px",
                                    bgcolor: "common.white",
                                    borderRadius: "0 20px 20px 0",
                                    transform: "translateY(-50%)",
                                    transition: "height 300ms",
                                },
                                ":hover::before": {
                                    height:
                                        router.query.guild === guild?.id
                                            ? "70%"
                                            : "50%",
                                },
                            }}
                        >
                            {!guild?.icon && (
                                <div>
                                    {guild ? (
                                        <Typography fontWeight="bold">
                                            {getGuildInitials(guild?.name)}
                                        </Typography>
                                    ) : (
                                        <Home />
                                    )}
                                </div>
                            )}
                        </Avatar>
                    </LightTooltip>
                </StyledBadge>
            </Box>
        </Link>
    );
};
