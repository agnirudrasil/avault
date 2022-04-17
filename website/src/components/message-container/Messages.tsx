import {
    Avatar,
    Box,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { Fragment, memo, useMemo } from "react";
import { Waypoint } from "react-waypoint";
import { useMessages } from "../../../hooks/requests/useMessages";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import type { Messages as MessagesType } from "../../../stores/useMessagesStore";
import { useUserStore } from "../../../stores/useUserStore";
import type { Channel } from "../../../types/channels";
import { getUser } from "../../user-cache";
import { ChannelIcon } from "../ChannelIcon";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { Markdown } from "../markdown/Markdown";
import { SkeletonLoader } from "../SkeletonLoader";
import { Attachments } from "./Attachments";
import { NewIndicator } from "./NewIndicator";

export const Message: React.FC<{ message: MessagesType; guild: string }> = memo(
    ({ message, guild }) => {
        const member = useGuildsStore(
            state => state.guilds[guild]?.members[getUser()]
        );

        const isMention = useMemo(
            () =>
                message.mention_everyone ||
                message.mention?.includes(getUser()) ||
                message.mention_roles?.some(m => member?.roles?.includes(m)),
            [message, member]
        );

        return (
            <ListItemButton
                disableRipple
                selected={isMention}
                sx={{
                    cursor: "default",
                    borderLeft: isMention ? `3px solid white` : undefined,
                }}
                id={message.id}
                key={message.id}
            >
                <ListItemAvatar
                    sx={{
                        alignSelf: "flex-start",
                        position: "sticky",
                        top: "0",
                        left: "0",
                        mt: 1,
                    }}
                >
                    <Avatar>
                        <DefaultProfilePic tag={message.author.tag} />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography color="GrayText" variant="subtitle1">
                            {message.author.username}
                        </Typography>
                    }
                    secondary={
                        <Stack>
                            <Markdown content={message.content} />
                            <Stack spacing={1}>
                                {message.attachments &&
                                    message.attachments.map(attachment => (
                                        <Attachments
                                            key={attachment.id}
                                            attachment={attachment}
                                        />
                                    ))}
                            </Stack>
                        </Stack>
                    }
                />
            </ListItemButton>
        );
    }
);

export const Messages: React.FC<{ channel: Channel }> = memo(({ channel }) => {
    const router = useRouter();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } =
        useMessages(router.query.channel as string);
    const lastRead = useUserStore(state => state.unread[channel.id].lastRead);

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
            {data?.pages.map((page, pageIndex) =>
                page?.map((message: MessagesType, index) => (
                    <Fragment key={message.id}>
                        {index !== 0 &&
                            pageIndex === 0 &&
                            lastRead === message.id && <NewIndicator />}
                        <Message
                            guild={router.query.guild as string}
                            message={message}
                        />
                    </Fragment>
                ))
            )}
            <Waypoint
                onEnter={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
            />
            {(!hasNextPage || !isFetchingNextPage) && (
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
