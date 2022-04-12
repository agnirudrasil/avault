import { AddReaction, Delete, Edit, PushPin, Reply } from "@mui/icons-material";
import {
    ListItem,
    ListItemAvatar,
    Typography,
    ListItemText,
    Avatar,
    Paper,
    Button,
    ButtonGroup,
    TextField,
    Link,
    Tooltip,
    Popover,
    Grow,
    Box,
    ListItemIcon,
    Chip,
    Stack,
} from "@mui/material";
import { DefaultProfilePic } from "./DefaultProfilePic";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useEditMessage } from "../../hooks/requests/useMessageEdit";
import { useDeleteMessage } from "../../hooks/requests/useMessageDelete";
import { Emoji, EmojiData, getEmojiDataFromNative, Picker } from "emoji-mart";
import { useCreateReaction } from "../../hooks/requests/useCreateReaction";
import { Messages, Reactions } from "../../stores/useMessagesStore";
import emojiData from "emoji-mart/data/all.json";
import { useDeleteReaction } from "../../hooks/requests/useDeleteReaction";
import { usePermssions } from "../../hooks/usePermissions";
import { checkPermissions } from "../compute-permissions";
import { Permissions } from "../permissions";
import { GuildMembers } from "../../stores/useUserStore";
import { Markdown } from "./markdown/Markdown";
import { Embeds } from "./Embeds";
import { useGuildsStore } from "../../stores/useGuildsStore";
import shallow from "zustand/shallow";
import { GuildMember } from "./GuildMember";
import { useGetReactions } from "../../hooks/requests/useGetReactions";
import { usePinMessage } from "../../hooks/requests/usePinMessage";
import { getUser } from "../user-cache";
import { useUnpinMessage } from "../../hooks/requests/useUnpinMessage";
import { UnreadNotifier } from "./UnreadNotifier";

const ToolBar: React.FC<{
    editFn: () => any;
    deleteFn: () => any;
    addReactionFn: (emoji: string) => any;
    message: Messages;
    permissions: bigint | "ALL";
    setReference: () => void;
    guildMember: GuildMembers;
}> = ({
    editFn,
    deleteFn,
    addReactionFn,
    permissions,
    guildMember,
    message,
    setReference,
}) => {
    const [open, setOpen] = useState<HTMLElement | null>(null);
    const { mutate: pinMessage } = usePinMessage(message.channel_id);
    const { mutate: unpinMessage } = useUnpinMessage(message.channel_id);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        setOpen(e.currentTarget);
    };

    return (
        <Paper
            sx={{
                position: "absolute",
                top: "0",
                right: "10px",
                visibility: "hidden",
                transform: "translateY(-50%)",
                "&:hover": {
                    boxShadow:
                        "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                },
            }}
            variant="outlined"
            className="toolbar"
        >
            <Popover
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "right",
                }}
                open={Boolean(open)}
                onClose={() => setOpen(null)}
                anchorEl={open}
            >
                <Picker
                    set="twitter"
                    onSelect={emoji => {
                        addReactionFn(
                            (emoji as EmojiData & { native: string })
                                .native as string
                        );
                        setOpen(null);
                    }}
                />
            </Popover>
            <ButtonGroup variant="text">
                {(message.author_id === guildMember.user?.id ||
                    !checkPermissions(
                        permissions,
                        Permissions.SEND_MESSAGES
                    )) && (
                    <Button onClick={editFn} size="small">
                        <Edit />
                    </Button>
                )}
                {(message.author_id === guildMember.user?.id ||
                    checkPermissions(
                        permissions,
                        Permissions.MANAGE_MESSAGES
                    )) && (
                    <Button onClick={deleteFn} size="small">
                        <Delete />
                    </Button>
                )}
                {checkPermissions(permissions, Permissions.MANAGE_MESSAGES) && (
                    <Button
                        color={message.pinned ? "error" : "primary"}
                        onClick={() => {
                            if (message.pinned) {
                                unpinMessage({ messageId: message.id });
                            } else {
                                pinMessage({ messageId: message.id });
                            }
                        }}
                        size="small"
                    >
                        <PushPin />
                    </Button>
                )}
                {checkPermissions(permissions, Permissions.ADD_REACTIONS) && (
                    <Button onClick={handleOpen} size="small">
                        <AddReaction />
                    </Button>
                )}
                {message.type !== 2 && (
                    <Button onClick={setReference} size="small">
                        <Reply />
                    </Button>
                )}
            </ButtonGroup>
        </Paper>
    );
};

export const EditMessageField: React.FC<{
    disabled: boolean;
    defaultValue: string;
    editFn: (value: string) => any;
    setEditing: () => any;
}> = ({ defaultValue, editFn, setEditing, disabled }) => {
    const [value, setValue] = useState(defaultValue);

    return (
        <TextField
            multiline
            minRows={1}
            onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    editFn(value);
                    setEditing();
                } else if (e.key === "Escape") {
                    setEditing();
                }
            }}
            fullWidth
            disabled={disabled}
            value={value}
            onChange={e => {
                setValue(e.target.value);
            }}
            placeholder={
                disabled
                    ? "You do not have permission to send message in this channel"
                    : "Edit message"
            }
            sx={{ margin: "1rem" }}
        />
    );
};

export const Message: React.FC<{
    type: "full" | "half";
    onOpenPins: () => void;
    message: Messages;
    reference?: Messages;
    lastRead?: string;
    setReference: (message: Messages) => void;
}> = ({ message, type, setReference, reference, onOpenPins, lastRead }) => {
    const [editing, setEditing] = useState(false);
    const router = useRouter();
    const { mutate } = useEditMessage(router.query.channel as string);
    const { mutate: mutateDelete } = useDeleteMessage(
        router.query.channel as string
    );
    const members: any = useGuildsStore(
        state => state[router.query.server_id as string].members,
        shallow
    );

    const { mutateAsync } = useCreateReaction();
    const { mutateAsync: deleteReaction } = useDeleteReaction();
    const { permissions, guildMember }: any = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );

    const editFn = (messageId: string, content: string) => {
        mutate({
            messageId,
            content,
            embeds: message.embeds,
        } as any);
        setEditing(false);
    };

    const deleteFn = (messageId: string) => {
        mutateDelete({ messageId });
    };

    const deleteReactionFn = async (emoji: string) => {
        await deleteReaction({
            message_id: message.id,
            emoji,
            channel_id: router.query.channel as string,
        });
    };

    const addReactionFn = async (emoji: string) => {
        await mutateAsync({
            emoji,
            channel_id: router.query.channel as string,
            message_id: message.id,
        });
    };

    if (message.type === 1) {
        console.log(message);
    }

    return (
        <div>
            {message.type === 2 ? (
                <PinnedMessage
                    onOpenPins={onOpenPins}
                    message={message}
                    guildMember={guildMember}
                />
            ) : message.type === 1 ? (
                <ReplyingMessage
                    members={members}
                    addReactionFn={addReactionFn}
                    deleteReactionFn={deleteReactionFn}
                    message={message}
                    permissions={permissions}
                    setReference={setReference}
                    deleteFn={deleteFn}
                    editFn={editFn}
                    setEditing={setEditing}
                    editing={editing}
                    reference={reference}
                    guildMember={guildMember}
                />
            ) : type === "full" ? (
                <ListItem
                    sx={{
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.05)",
                        },
                        "&:hover .time": {
                            visibility: "visible",
                        },
                        "&:hover .toolbar": {
                            visibility: "visible",
                        },
                        paddingTop: "0",
                        paddingBottom: "0",
                        backgroundColor:
                            reference?.id === message.id
                                ? "rgba(63, 191, 191, 0.31)"
                                : "transparent",
                    }}
                >
                    <ToolBar
                        setReference={() => setReference(message)}
                        editFn={() => setEditing(prev => !prev)}
                        deleteFn={() => deleteFn(message.id)}
                        addReactionFn={addReactionFn}
                        permissions={permissions}
                        guildMember={guildMember}
                        message={message}
                    />
                    <ListItemAvatar
                        sx={{ visibility: "hidden" }}
                        className="time"
                    >
                        <Typography
                            variant="overline"
                            color="textSecondary"
                            sx={{
                                marginLeft: "-0.25rem",
                                userSelect: "none",
                            }}
                        >
                            {new Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                            })
                                .format(message.timestamp)
                                .replaceAll(" ", "")}
                        </Typography>
                    </ListItemAvatar>
                    {editing ? (
                        <div style={{ width: "80%" }}>
                            <EditMessageField
                                disabled={
                                    !checkPermissions(
                                        permissions,
                                        Permissions.SEND_MESSAGES
                                    )
                                }
                                defaultValue={message.content}
                                editFn={value => editFn(message.id, value)}
                                setEditing={() => setEditing(false)}
                            />
                            <Typography component="div">
                                escape to{" "}
                                <Link
                                    sx={{ cursor: "pointer" }}
                                    underline="hover"
                                    onClick={() => setEditing(false)}
                                >
                                    cancel
                                </Link>{" "}
                                {/* • enter to{" "}
                                <Link
                                    sx={{ cursor: "pointer" }}
                                    underline="hover"
                                    onClick={() => {
                                        setEditing(false);
                                    }}
                                >
                                    save
                                </Link> */}
                            </Typography>
                        </div>
                    ) : (
                        <ListItemText
                            secondary={
                                <div>
                                    <Stack spacing={2}>
                                        {message.embeds?.map((e, i) => (
                                            <Embeds
                                                message={message}
                                                author={message.author.id}
                                                permissions={permissions}
                                                embed={e}
                                                key={i}
                                            />
                                        ))}
                                    </Stack>
                                    {message.reactions.map(reaction => (
                                        <Reaction
                                            channel={
                                                router.query.channel as string
                                            }
                                            message={message.id}
                                            reaction={reaction}
                                            key={reaction.emoji}
                                            addReactionFn={addReactionFn}
                                            deleteFn={deleteReactionFn}
                                        />
                                    ))}
                                </div>
                            }
                            primary={
                                <Typography>
                                    <Markdown content={message.content} />
                                    {message.edited_timestamp && (
                                        <Tooltip
                                            title={new Date(
                                                message.edited_timestamp
                                            ).toString()}
                                        >
                                            <Typography
                                                component="span"
                                                variant="subtitle2"
                                                color="GrayText"
                                                style={{
                                                    cursor: "default",
                                                    userSelect: "none",
                                                }}
                                            >
                                                {"  "}
                                                (edited)
                                            </Typography>
                                        </Tooltip>
                                    )}
                                </Typography>
                            }
                        />
                    )}
                </ListItem>
            ) : (
                <ListItem
                    sx={{
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.05)",
                        },
                        "&:hover .toolbar": {
                            visibility: "visible",
                        },
                        backgroundColor:
                            reference?.id === message.id
                                ? "rgba(63, 191, 191, 0.31)"
                                : "transparent",
                    }}
                    key={message.id}
                    dense
                >
                    <ToolBar
                        setReference={() => setReference(message)}
                        editFn={() => setEditing(prev => !prev)}
                        deleteFn={() => deleteFn(message.id)}
                        addReactionFn={addReactionFn}
                        permissions={permissions}
                        guildMember={guildMember}
                        message={message}
                    />
                    <ListItemAvatar>
                        <Avatar>
                            <DefaultProfilePic tag={message.author.tag} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Stack direction="row" spacing={1}>
                                <Link
                                    sx={{ color: "inherit", cursor: "pointer" }}
                                    underline="hover"
                                >
                                    <GuildMember id={message.author.id}>
                                        <Typography
                                            style={{
                                                userSelect: "none",
                                                display: "flex",
                                            }}
                                            variant="subtitle2"
                                        >
                                            {(members &&
                                                members[message.author.id]
                                                    ?.nick) ||
                                                message.author.username}
                                        </Typography>
                                    </GuildMember>
                                </Link>
                                {message.author.bot && (
                                    <Chip
                                        sx={{ borderRadius: "3px" }}
                                        size="small"
                                        label="BOT"
                                        color="primary"
                                    />
                                )}
                            </Stack>
                        }
                        secondary={
                            <div>
                                {editing ? (
                                    <div style={{ width: "80%" }}>
                                        <Typography component="div">
                                            <EditMessageField
                                                disabled={
                                                    !checkPermissions(
                                                        permissions,
                                                        Permissions.SEND_MESSAGES
                                                    )
                                                }
                                                defaultValue={message.content}
                                                editFn={value =>
                                                    editFn(message.id, value)
                                                }
                                                setEditing={() =>
                                                    setEditing(false)
                                                }
                                            />
                                            escape to{" "}
                                            <Link
                                                sx={{ cursor: "pointer" }}
                                                underline="hover"
                                                onClick={() =>
                                                    setEditing(false)
                                                }
                                            >
                                                cancel
                                            </Link>{" "}
                                            {/* • enter to{" "}
                                            <Link
                                                sx={{ cursor: "pointer" }}
                                                underline="hover"
                                                onClick={() => {
                                                    setEditing(false);
                                                    editFn(
                                                        message.id,
                                                        editRef.current!.value
                                                    );
                                                }}
                                            >
                                                save
                                            </Link> */}
                                        </Typography>
                                    </div>
                                ) : (
                                    <Typography color="ButtonText">
                                        <Markdown content={message.content} />
                                    </Typography>
                                )}
                                <div>
                                    <Stack spacing={1}>
                                        {message.embeds?.map((e, i) => (
                                            <Embeds
                                                message={message}
                                                author={message.author.id}
                                                permissions={permissions}
                                                embed={e}
                                                key={i}
                                            />
                                        ))}
                                    </Stack>
                                    {message.reactions.map(reaction => (
                                        <Reaction
                                            channel={
                                                router.query.channel as string
                                            }
                                            message={message.id}
                                            reaction={reaction}
                                            key={reaction.emoji}
                                            addReactionFn={addReactionFn}
                                            deleteFn={deleteReactionFn}
                                        />
                                    ))}
                                </div>
                            </div>
                        }
                    />
                </ListItem>
            )}
            {lastRead && lastRead === message.id && <UnreadNotifier />}
        </div>
    );
};

const Reaction: React.FC<{
    reaction: Reactions;
    channel: string;
    message: string;
    deleteFn: (emoji: string) => any;
    addReactionFn: (emoji: string) => any;
}> = ({ reaction, deleteFn, addReactionFn, channel, message }) => {
    const { data } = useGetReactions(channel, message, reaction.emoji);
    const handleClick = () => {
        if (reaction.me) {
            deleteFn(reaction.emoji);
        } else {
            addReactionFn(reaction.emoji);
        }
    };

    return (
        <Grow in={true} exit={true} timeout={300}>
            <Tooltip
                placement="top"
                title={data ? data.map((d: any) => d.username).join(", ") : ""}
            >
                <Button
                    variant="outlined"
                    startIcon={
                        <Emoji
                            emoji={getEmojiDataFromNative(
                                reaction.emoji,
                                "twitter",
                                emojiData
                            )}
                            set="twitter"
                            size={16}
                        />
                    }
                    onClick={handleClick}
                    size="small"
                    style={{
                        backgroundColor: reaction.me ? "#55ddff61" : "white",
                        verticalAlign: "middle",
                        padding: "0.01rem",
                        marginRight: "0.2rem",
                    }}
                >
                    {reaction.count}
                </Button>
            </Tooltip>
        </Grow>
    );
};

export const PinnedMessage: React.FC<{
    message: Messages;
    guildMember: any;
    onOpenPins: () => void;
}> = ({ onOpenPins, message, guildMember }) => {
    return (
        <ListItem
            sx={{
                ":hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
            }}
            key={message.id}
            dense
        >
            <ListItemIcon>
                <PushPin />
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography>
                        <Stack direction="row" spacing={1}>
                            <Link
                                underline="hover"
                                sx={{
                                    cursor: "pointer",
                                    color: "black",
                                    fontWeight: "bold",
                                }}
                            >
                                <GuildMember id={message.author.id}>
                                    {guildMember.nick ||
                                        message.author.username}
                                </GuildMember>
                            </Link>{" "}
                            {message.author.bot && (
                                <Chip
                                    size="small"
                                    sx={{ borderRadius: "3px" }}
                                    label="BOT"
                                    color="primary"
                                />
                            )}
                        </Stack>
                        Pinned a message to this channel. See all{" "}
                        <span>
                            <Link
                                onClick={onOpenPins}
                                underline="hover"
                                sx={{
                                    cursor: "pointer",
                                    color: "black",
                                    fontWeight: "bold",
                                }}
                            >
                                pinned messages
                            </Link>
                        </span>
                        .
                    </Typography>
                }
            />
        </ListItem>
    );
};

export const ReplyingMessage: React.FC<{
    message: Messages;
    setReference: (message: Messages) => void;
    setEditing: any;
    deleteFn: any;
    addReactionFn: any;
    permissions: any;
    guildMember: any;
    editFn: any;
    reference?: Messages;
    members: any;
    editing: boolean;
    deleteReactionFn: any;
}> = ({
    members,
    message,
    reference,
    deleteReactionFn,
    editFn,
    editing,
    setReference,
    setEditing,
    deleteFn,
    addReactionFn,
    permissions,
    guildMember,
}) => {
    const router = useRouter();
    return (
        <div>
            <Box
                sx={{
                    "&:hover": { background: "rgba(0, 0, 0, 0.05)" },
                    maxWidth: "100%",
                    overflow: "hidden",
                    borderLeft:
                        message.reply!.author.id === getUser()
                            ? "3px solid #BFBF3F"
                            : "",
                    backgroundColor:
                        reference?.id === message.id
                            ? "rgba(63, 191, 191, 0.31)"
                            : message.reply!.author.id === getUser()
                            ? "rgba(191, 191, 63, 0.2)"
                            : "transparent",
                    position: "relative",
                    height: "max-content",
                }}
            >
                <Box
                    sx={{
                        ml: "4.5rem",
                        display: "flex",
                        maxWidth: "100%",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "0.25rem",
                        marginBottom: "-5px",
                        position: "relative",
                        "::before": {
                            position: "absolute",
                            content: '""',
                            width: "2.25rem",
                            height: "16px",
                            top: "40%",
                            left: "-0.25rem",
                            borderLeft: "2px solid #ccc",
                            borderTop: "2px solid #ccc",
                            borderTopLeftRadius: "10px",
                            transform: "translateX(-100%)",
                        },
                    }}
                >
                    <Avatar sx={{ width: "18px", height: "18px" }}>
                        <DefaultProfilePic
                            width={18}
                            height={18}
                            tag={message.reply!.author.tag}
                        />
                    </Avatar>
                    <Typography>
                        <GuildMember id={message.reply!.author.id}>
                            @
                            {(members &&
                                members[message.reply!.author.id]?.nick) ||
                                message.reply!.author.username}{" "}
                            {message.reply?.author.bot && (
                                <Chip
                                    size="small"
                                    sx={{ borderRadius: "3px" }}
                                    label="BOT"
                                    color="primary"
                                />
                            )}
                        </GuildMember>
                    </Typography>
                    <Typography
                        sx={{
                            maxWidth: "100%",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            "> img": { width: "18px", height: "18px" },
                        }}
                        color="GrayText"
                    >
                        <Markdown
                            style={{
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            content={message.reply!.content}
                        />
                    </Typography>
                </Box>
                <ListItem
                    sx={{
                        "&:hover .toolbar": {
                            visibility: "visible",
                        },
                    }}
                    key={message.id}
                    dense
                >
                    <ToolBar
                        setReference={() => setReference(message)}
                        editFn={() => setEditing((prev: any) => !prev)}
                        deleteFn={() => deleteFn(message.id)}
                        addReactionFn={addReactionFn}
                        permissions={permissions}
                        guildMember={guildMember}
                        message={message}
                    />
                    <ListItemAvatar>
                        <Avatar>
                            <DefaultProfilePic tag={message.author.tag} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Stack direction="row" spacing={1}>
                                <Link
                                    sx={{ color: "inherit", cursor: "pointer" }}
                                    underline="hover"
                                >
                                    <GuildMember id={message.author.id}>
                                        <Typography
                                            style={{ userSelect: "none" }}
                                            variant="subtitle2"
                                        >
                                            {(members &&
                                                members[message.author.id]
                                                    ?.nick) ||
                                                message.author.username}
                                        </Typography>
                                    </GuildMember>
                                </Link>
                                {message.author.bot && (
                                    <Chip
                                        size="small"
                                        sx={{ borderRadius: "3px" }}
                                        label="BOT"
                                        color="primary"
                                    />
                                )}
                            </Stack>
                        }
                        secondary={
                            <div>
                                {editing ? (
                                    <div style={{ width: "80%" }}>
                                        <Typography component="div">
                                            <EditMessageField
                                                disabled={
                                                    !checkPermissions(
                                                        permissions,
                                                        Permissions.SEND_MESSAGES
                                                    )
                                                }
                                                defaultValue={message.content}
                                                editFn={value =>
                                                    editFn(message.id, value)
                                                }
                                                setEditing={() =>
                                                    setEditing(false)
                                                }
                                            />
                                            escape to{" "}
                                            <Link
                                                sx={{ cursor: "pointer" }}
                                                underline="hover"
                                                onClick={() =>
                                                    setEditing(false)
                                                }
                                            >
                                                cancel
                                            </Link>{" "}
                                            {/* • enter to{" "}
                                            <Link
                                                sx={{ cursor: "pointer" }}
                                                underline="hover"
                                                onClick={() => {
                                                    setEditing(false);
                                                    editFn(
                                                        message.id,
                                                        editRef.current!.value
                                                    );
                                                }}
                                            >
                                                save
                                            </Link> */}
                                        </Typography>
                                    </div>
                                ) : (
                                    <Typography color="ButtonText">
                                        <Markdown content={message.content} />
                                    </Typography>
                                )}
                                <div>
                                    <Stack spacing={1}>
                                        {message.embeds?.map((e, i) => (
                                            <Embeds
                                                message={message}
                                                permissions={permissions}
                                                author={message.author.id}
                                                embed={e}
                                                key={i}
                                            />
                                        ))}
                                    </Stack>
                                    {message.reactions.map(reaction => (
                                        <Reaction
                                            channel={
                                                router.query.channel as string
                                            }
                                            message={message.id}
                                            reaction={reaction}
                                            key={reaction.emoji}
                                            addReactionFn={addReactionFn}
                                            deleteFn={deleteReactionFn}
                                        />
                                    ))}
                                </div>
                            </div>
                        }
                    />
                </ListItem>
            </Box>
        </div>
    );
};
