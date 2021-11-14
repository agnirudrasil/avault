import { Delete, Edit } from "@mui/icons-material";
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
} from "@mui/material";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { useState } from "react";

const ToolBar: React.FC<{ editFn: () => any; deleteFn: () => any }> = ({
    editFn,
    deleteFn,
}) => {
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
            <ButtonGroup variant="text">
                <Button onClick={editFn} size="small">
                    <Edit />
                </Button>
                <Button onClick={deleteFn} size="small">
                    <Delete />
                </Button>
            </ButtonGroup>
        </Paper>
    );
};

export const Message: React.FC<{ type: "full" | "half"; message: any }> = ({
    message,
    type,
}) => {
    const [editing, setEditing] = useState(false);
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
                        deleteFn={() => {}}
                    />
                    <ListItemAvatar
                        sx={{ visibility: "hidden" }}
                        className="time"
                    >
                        <Typography
                            variant="overline"
                            color="textSecondary"
                            sx={{ marginLeft: "-0.25rem" }}
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
                        <TextField
                            fullWidth
                            defaultValue={message.content}
                            sx={{ margin: "1rem" }}
                        />
                    ) : (
                        <ListItemText
                            primary={<Typography>{message.content}</Typography>}
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
                        deleteFn={() => {}}
                    />
                    <ListItemAvatar>
                        <Avatar>
                            <DefaultProfilePic tag={message.author.tag} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Typography variant="subtitle2">
                                {message.author.username}
                            </Typography>
                        }
                        secondary={
                            editing ? (
                                <TextField
                                    fullWidth
                                    defaultValue={message.content}
                                />
                            ) : (
                                <Typography>{message.content}</Typography>
                            )
                        }
                    />
                </ListItem>
            )}
        </>
    );
};
