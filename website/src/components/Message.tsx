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
} from "@mui/material";
import { DefaultProfilePic } from "./DefaultProfilePic";
import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useEditMessage } from "../../hooks/requests/useMessageEdit";
import { useDeleteMessage } from "../../hooks/requests/useMessageDelete";
import { EmojiData, Picker } from "emoji-mart";
import { useCreateReaction } from "../../hooks/requests/useCreateReaction";
import { Messages } from "../../stores/useMessagesStore";

const ToolBar: React.FC<{
    editFn: () => any;
    deleteFn: () => any;
    addReactionFn: (emoji: string) => any;
}> = ({ editFn, deleteFn, addReactionFn }) => {
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
                <Button onClick={editFn} size="small">
                    <Edit />
                </Button>
                <Button onClick={deleteFn} size="small">
                    <Delete />
                </Button>
                <Button onClick={handleOpen} size="small">
                    <AddReaction />
                </Button>
                <Button size="small">
                    <MoreHoriz />
                </Button>
            </ButtonGroup>
        </Paper>
    );
};

export const EditMessageField: React.FC<{
    defaultValue: string;
    editFn: (value: string) => any;
    setEditing: () => any;
}> = ({ defaultValue, editFn, setEditing }) => {
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
            value={value}
            onChange={e => {
                setValue(e.target.value);
            }}
            sx={{ margin: "1rem" }}
        />
    );
};

export const Message: React.FC<{ type: "full" | "half"; message: Messages }> =
    ({ message, type }) => {
        const [editing, setEditing] = useState(false);
        const editRef = useRef<HTMLInputElement | null>(null);
        const router = useRouter();
        const { mutate } = useEditMessage(router.query.channel as string);
        const { mutate: mutateDelete } = useDeleteMessage(
            router.query.channel as string
        );
        const { mutateAsync } = useCreateReaction();

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
                                    • enter to{" "}
                                    <Link
                                        sx={{ cursor: "pointer" }}
                                        underline="hover"
                                        onClick={() => {
                                            editFn(
                                                message.id,
                                                editRef.current!.value
                                            );
                                            setEditing(false);
                                        }}
                                    >
                                        save
                                    </Link>
                                </Typography>
                            </div>
                        ) : (
                            <ListItemText
                                secondary={message.reactions.map(reaction => (
                                    <span
                                        style={{
                                            margin: "0.2rem",
                                            padding: "0.25rem",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            border: "1px solid #ccc",
                                            backgroundColor: reaction.me
                                                ? "#55ddff61"
                                                : "white",
                                        }}
                                    >
                                        {reaction.emoji} {reaction.count}
                                    </span>
                                ))}
                                primary={
                                    <Typography>
                                        {message.content}
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
                        />
                        <ListItemAvatar>
                            <Avatar>
                                <DefaultProfilePic tag={message.author.tag} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography
                                    style={{ userSelect: "none" }}
                                    variant="subtitle2"
                                >
                                    {message.author.username}
                                </Typography>
                            }
                            secondary={
                                <div>
                                    {editing ? (
                                        <div style={{ width: "80%" }}>
                                            <Typography component="div">
                                                <EditMessageField
                                                    defaultValue={
                                                        message.content
                                                    }
                                                    editFn={value =>
                                                        editFn(
                                                            message.id,
                                                            value
                                                        )
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
                                                • enter to{" "}
                                                <Link
                                                    sx={{ cursor: "pointer" }}
                                                    underline="hover"
                                                    onClick={() => {
                                                        editFn(
                                                            message.id,
                                                            editRef.current!
                                                                .value
                                                        );
                                                        setEditing(false);
                                                    }}
                                                >
                                                    save
                                                </Link>
                                            </Typography>
                                        </div>
                                    ) : (
                                        <Typography>
                                            {message.content}
                                        </Typography>
                                    )}
                                    {message.reactions.map(reaction => (
                                        <span
                                            style={{
                                                padding: "0.25rem",
                                                margin: "0.2rem",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                border: "1px solid #ccc",
                                                backgroundColor: reaction.me
                                                    ? "#55ddff61"
                                                    : "white",
                                            }}
                                        >
                                            {reaction.emoji} {reaction.count}
                                        </span>
                                    ))}
                                </div>
                            }
                        />
                    </ListItem>
                )}
            </>
        );
    };
