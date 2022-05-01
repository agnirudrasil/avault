import { Box, List, Typography } from "@mui/material";
import { differenceInSeconds, format, isToday, isYesterday } from "date-fns";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { Waypoint } from "react-waypoint";
import { useMessages } from "../../../hooks/requests/useMessages";
import { useUserStore } from "../../../stores/useUserStore";
import type { Channel } from "../../../types/channels";
import { groupBy } from "../../group-by";
import { ChannelIcon } from "../ChannelIcon";
import { SkeletonLoader } from "../SkeletonLoader";
import { Message } from "./message";

export const Messages: React.FC<{ channel: Channel }> = memo(({ channel }) => {
    const router = useRouter();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } =
        useMessages(router.query.channel as string);
    const lastRead = useUserStore(state => state.unread[channel.id]?.lastRead);

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
                                key={message.id}
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
                            p: 1,
                            borderRadius: "70px",
                            bgcolor: "grey.800",
                        }}
                    >
                        <ChannelIcon
                            sx={{
                                width: "100%",
                                height: "100%",
                                stroke: "white",
                            }}
                        />
                    </Box>
                    <Typography fontWeight="bold" variant="h3">
                        Welcome to #{channel.name}!
                    </Typography>
                    <Typography variant="subtitle1" color="GrayText">
                        This is the start of #{channel.name}.
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
