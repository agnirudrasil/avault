import { AddReaction, Delete, Edit, MoreHoriz } from "@mui/icons-material";
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
} from "@mui/material";
import { DefaultProfilePic } from "./DefaultProfilePic";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useEditMessage } from "../../hooks/requests/useMessageEdit";
import { useDeleteMessage } from "../../hooks/requests/useMessageDelete";
import { Emoji, EmojiData, getEmojiDataFromNative, Picker } from "emoji-mart";
import { useCreateReaction } from "../../hooks/requests/useCreateReaction";
import { Messages, Reactions } from "../../stores/useMessagesStore";
import data from "emoji-mart/data/all.json";
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

const ToolBar: React.FC<{
    editFn: () => any;
    deleteFn: () => any;
    addReactionFn: (emoji: string) => any;
    message: Messages;
    permissions: bigint | "ALL";
    guildMember: GuildMembers;
}> = ({
    editFn,
    deleteFn,
    addReactionFn,
    permissions,
    guildMember,
    message,
}) => {
    const [open, setOpen] = useState<HTMLElement | null>(null);

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
                {checkPermissions(permissions, Permissions.ADD_REACTIONS) && (
                    <Button onClick={handleOpen} size="small">
                        <AddReaction />
                    </Button>
                )}
                <Button size="small">
                    <MoreHoriz />
                </Button>
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
    message: Messages;
}> = ({ message, type }) => {
    const [editing, setEditing] = useState(false);
    const router = useRouter();
    const { mutate } = useEditMessage(router.query.channel as string);
    const { mutate: mutateDelete } = useDeleteMessage(
        router.query.channel as string
    );
    const members = useGuildsStore(
        state => state[router.query.server_id as string].members,
        shallow
    );

    const { mutateAsync } = useCreateReaction();
    const { mutateAsync: deleteReaction } = useDeleteReaction();
    const { permissions, guildMember } = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );

    const editFn = (messageId: string, content: string) => {
        mutate({
            messageId,
            content,
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

    return (
        <>
            {type === "full" ? (
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
                    }}
                >
                    <ToolBar
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
                                    {message.embeds?.map((e, i) => (
                                        <Embeds embed={e} key={i} />
                                    ))}
                                    {message.reactions.map(reaction => (
                                        <Reaction
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
                    }}
                    key={message.id}
                    dense
                >
                    <ToolBar
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
                                            members[message.author.id].nick) ||
                                            message.author.username}
                                    </Typography>
                                </GuildMember>
                            </Link>
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
                                    {message.embeds?.map((e, i) => (
                                        <Embeds embed={e} key={i} />
                                    ))}
                                    {message.reactions.map(reaction => (
                                        <Reaction
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
        </>
    );
};

const Reaction: React.FC<{
    reaction: Reactions;
    deleteFn: (emoji: string) => any;
    addReactionFn: (emoji: string) => any;
}> = ({ reaction, deleteFn, addReactionFn }) => {
    const handleClick = () => {
        if (reaction.me) {
            deleteFn(reaction.emoji);
        } else {
            addReactionFn(reaction.emoji);
        }
    };

    return (
        <Grow in={true} exit={true} timeout={300}>
            <Button
                variant="outlined"
                startIcon={
                    <Emoji
                        emoji={getEmojiDataFromNative(
                            reaction.emoji,
                            "twitter",
                            data
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
        </Grow>
    );
};
