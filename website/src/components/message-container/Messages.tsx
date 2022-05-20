import { Group } from "@mui/icons-material";
import { Avatar, Box, List, Typography } from "@mui/material";
import { differenceInSeconds, format, isToday, isYesterday } from "date-fns";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { Waypoint } from "react-waypoint";
import { useMessages } from "../../../hooks/requests/useMessages";
import { useUserStore } from "../../../stores/useUserStore";
import type { Channel } from "../../../types/channels";
import { getGroupDMName } from "../../getGroupDmName";
import { groupBy } from "../../group-by";
import { ChannelIcon } from "../ChannelIcon";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { SkeletonLoader } from "../SkeletonLoader";
import { Message } from "./message";

export const Messages: React.FC<{ channel: Channel }> = memo(({ channel }) => {
    const router = useRouter();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } =
        useMessages(router.query.channel as string);
    const lastRead = useUserStore(state => state.unread[channel.id]?.lastRead);

    console.log(data?.pages.flat());

    const group = useMemo(() => {
        if (data) {
            return groupBy(data.pages.flat());
        }
        return {};
    }, [data, data?.pages]);

    return (
        <List
            sx={{
                mb: 3,
                maxHeight: "100%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column-reverse",
            }}
            dense
        >
            {Object.keys(group).map(time => {
                const messageGroups = group[time];
                const date = new Date(time);
                return (
                    <Box sx={{ position: "relative" }} key={time}>
                        <Box
                            sx={{
                                bgcolor: "white",
                                width: "max-content",
                                color: "black",
                                p: 0.5,
                                borderRadius: "6px",
                                margin: "0 auto",
                                position: "sticky",
                                top: 0,
                                mt: 2,
                            }}
                        >
                            <Typography
                                sx={{ userSelect: "none" }}
                                variant="body2"
                            >
                                {isToday(date)
                                    ? "Today"
                                    : isYesterday(date)
                                    ? "Yesterday"
                                    : format(date, "MMM d, yyyy")}
                            </Typography>
                        </Box>
                        {messageGroups.reverse().map((message, i, array) => (
                            <Message
                                args={(message as any).args}
                                error={(message as any).error}
                                confirmed={(message as any).confirmed}
                                key={message.nonce || message.id}
                                disableHeader={
                                    i !== 0 &&
                                    array[i - 1]?.author.id ===
                                        message.author.id &&
                                    differenceInSeconds(
                                        new Date(message.timestamp),
                                        new Date(array[i - 1].timestamp)
                                    ) < 300
                                }
                                newMessage={
                                    lastRead === undefined
                                        ? i === 0
                                        : i !== 0 &&
                                          array[i - 1]?.id === lastRead
                                }
                                guild={router.query.guild as string}
                                message={message}
                            />
                        ))}
                    </Box>
                );
            })}
            <Waypoint
                onEnter={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
            />
            {(!hasNextPage || !isFetching) && (
                <Box sx={{ m: 2 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            p:
                                channel.type === "DM" ||
                                channel.type === "GROUP_DM"
                                    ? 0
                                    : 1,
                            borderRadius: "70px",
                            bgcolor: "grey.800",
                        }}
                    >
                        {channel.type === "DM" ? (
                            <Avatar
                                src={
                                    channel.recipients[0].avatar
                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${channel.recipients[0].id}/${channel.recipients[0].avatar}`
                                        : undefined
                                }
                                sx={{ width: "64px", height: "64px" }}
                            >
                                <DefaultProfilePic
                                    width={64}
                                    height={64}
                                    tag={channel.recipients[0].tag}
                                />
                            </Avatar>
                        ) : channel.type === "GROUP_DM" ? (
                            <Avatar
                                src={
                                    channel.icon
                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}channel-icons/${channel.id}/${channel.icon}`
                                        : undefined
                                }
                                sx={{
                                    width: "64px",
                                    height: "64px",
                                    bgcolor: "success.dark",
                                    color: "white",
                                }}
                            >
                                <Group />
                            </Avatar>
                        ) : (
                            <ChannelIcon
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    stroke: "white",
                                }}
                            />
                        )}
                    </Box>
                    <Typography fontWeight="bold" variant="h3">
                        {channel.type === "DM"
                            ? channel.recipients[0].username
                            : channel.type === "GROUP_DM"
                            ? getGroupDMName(channel)
                            : `Welcome to #${channel.name}!`}
                    </Typography>
                    <Typography variant="subtitle1" color="GrayText">
                        {channel.type === "DM" ? (
                            <span>
                                This is the beginning of your direct message
                                history with{" "}
                                <strong>
                                    @{channel.recipients[0].username}
                                </strong>
                            </span>
                        ) : channel.type === "GROUP_DM" ? (
                            <span>
                                Welcome to the beginning of the{" "}
                                <strong>{getGroupDMName(channel)}</strong> group
                            </span>
                        ) : (
                            `This is the start of #${channel.name}.`
                        )}
                    </Typography>
                </Box>
            )}
            <Box>
                {isFetching &&
                    Array(5)
                        .fill(0)
                        .map((_, i) => <SkeletonLoader key={i} />)}
            </Box>
        </List>
    );
});
