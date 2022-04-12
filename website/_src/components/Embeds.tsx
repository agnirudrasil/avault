import { Clear, Launch, PlayArrow } from "@mui/icons-material";
import {
    Avatar,
    Divider,
    IconButton,
    Link,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Modal,
    Stack,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useEditMessage } from "../../hooks/requests/useMessageEdit";
import { Messages } from "../../stores/useMessagesStore";
import { checkPermissions } from "../compute-permissions";
import { Permissions } from "../permissions";
import { getUser } from "../user-cache";
import { Markdown } from "./markdown/Markdown";

interface Image {
    width?: number;
    height?: number;
    url?: string;
}
interface Fields {
    name?: string;
    value?: string;
    inline?: boolean;
}

interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    color?: number;
    footer?: {
        text?: string;
        icon_url?: string;
    };
    image?: Image;
    thumbnail?: Image;
    video?: Image;
    author?: {
        name?: string;
        icon_url?: string;
        url?: string;
    };
    fields?: Fields[];
    timestamp?: string;
    provider?: {
        name?: string;
        url?: string;
    };
}

export const nestArray = (fields?: Fields[]) => {
    if (!fields) return [];
    const result: Fields[][] = [];
    let row = 0;

    for (let field of fields) {
        if (!result[row]) {
            result[row] = [];
        }
        if (result[row].length === 3 || !field.inline) {
            row++;
            result[row] = [];
        }
        result[row].push(field);
        if (!field.inline) {
            row++;
        }
    }

    return result;
};

export const Embeds: React.FC<{
    embed: any;
    permissions: any;
    author: string;
    message: Messages;
}> = ({ embed, permissions, author, message }) => {
    const [open, setOpen] = useState("");
    const handleOpen = (url: string) => setOpen(url);
    const handleClose = () => setOpen("");
    const fields = nestArray(embed.fields);

    const { mutateAsync } = useEditMessage(message.channel_id);

    return (
        <Stack alignItems="flex-start" direction="row">
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    background: "#eee",
                    borderRadius: "10px",
                    overflow: "hidden",
                    width: "max-content",
                    maxWidth: "500px",
                    padding: "1rem",
                    borderLeft: `5px solid #${
                        embed.color ? embed.color.toString(16) : "ddd"
                    }`,
                }}
            >
                <Stack spacing={2}>
                    {embed.provider && (
                        <Link
                            underline={embed.provider.url ? "hover" : "none"}
                            href={embed.provider.url}
                            target="_blank"
                            sx={{ color: "inherit" }}
                        >
                            <Typography variant="caption">
                                {embed.provider.name}
                            </Typography>
                        </Link>
                    )}
                    {embed.author && (
                        <ListItem sx={{ padding: "0" }}>
                            {embed.author.icon_url && (
                                <ListItemAvatar sx={{ minWidth: "32px" }}>
                                    <Avatar
                                        sx={{ width: "24px", height: "24px" }}
                                        src={embed.author.icon_url}
                                    />
                                </ListItemAvatar>
                            )}
                            {embed.author.name && (
                                <ListItemText
                                    primary={
                                        <Link
                                            target="_blank"
                                            href={embed.author.url}
                                            sx={{
                                                color: "black",
                                                fontWeight: "bold",
                                            }}
                                            underline={
                                                embed.author.url
                                                    ? "hover"
                                                    : "none"
                                            }
                                        >
                                            {embed.author.name}
                                        </Link>
                                    }
                                />
                            )}
                        </ListItem>
                    )}
                    {embed.title && (
                        <Link
                            href={embed.url}
                            target="_blank"
                            sx={{ fontWeight: "bold" }}
                            underline={embed.url ? "hover" : "none"}
                        >
                            <Typography variant="h6">{embed.title}</Typography>
                        </Link>
                    )}
                    {embed.description && (
                        <Typography
                            component="fePointLight"
                            sx={{ maxWidth: "100%" }}
                        >
                            <Markdown content={embed.description} />
                        </Typography>
                    )}
                    <Stack spacing={1}>
                        {fields.map((row, index) => (
                            <Stack key={index} direction="row" spacing={2}>
                                {row.map((field, index) => (
                                    <Box key={index}>
                                        <Typography variant="subtitle2">
                                            {field.name}
                                        </Typography>
                                        <Typography>
                                            <Markdown
                                                content={field.value || ""}
                                            />
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        ))}
                    </Stack>
                    {embed.type === "video" ? (
                        <EmbedVideo embed={embed} />
                    ) : (
                        embed.image && (
                            <img
                                style={{
                                    maxWidth: "100%",
                                    display: "block",
                                    width: "auto",
                                    height: "auto",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleOpen(embed.image?.url || "")
                                }
                                alt={embed?.title || "Image"}
                                src={embed?.image?.url}
                                width={embed?.image?.width}
                                height={embed?.image?.height}
                            />
                        )
                    )}
                    {embed.footer && (
                        <Stack
                            spacing={1}
                            divider={
                                <Divider flexItem orientation="vertical" />
                            }
                            direction="row"
                        >
                            <ListItem sx={{ padding: 0, width: "max-content" }}>
                                {embed.footer.icon_url && (
                                    <ListItemAvatar sx={{ minWidth: "32px" }}>
                                        <Avatar
                                            sx={{
                                                width: "24px",
                                                height: "24px",
                                            }}
                                            src={embed.footer.icon_url}
                                        />
                                    </ListItemAvatar>
                                )}
                                {embed.footer.text && (
                                    <Typography variant="caption">
                                        {embed.footer.text}
                                    </Typography>
                                )}
                            </ListItem>
                            {embed.timestamp && (
                                <ListItem
                                    sx={{ padding: 0, width: "max-content" }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="caption">
                                                {new Date(
                                                    embed.timestamp
                                                ).toLocaleString("en-IN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            )}
                        </Stack>
                    )}
                </Stack>
                {embed.thumbnail && (
                    <Box>
                        <img
                            style={{
                                maxWidth: "100px",
                                display: "block",
                                width: "auto",
                                height: "auto",
                                borderRadius: "10px",
                                cursor: "pointer",
                            }}
                            onClick={() =>
                                handleOpen(embed.thumbnail?.url || "")
                            }
                            alt={embed?.title || "Image"}
                            src={embed?.thumbnail?.url}
                        />
                    </Box>
                )}
                <Modal open={Boolean(open)} onClose={handleClose}>
                    <Stack
                        gap={2}
                        sx={{
                            position: "absolute" as "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <img
                            style={{
                                borderRadius: "10px",
                            }}
                            alt={embed.title || "Image"}
                            src={open}
                            width={embed?.image?.width}
                            height={embed?.image?.height}
                        />
                        <Link
                            href={embed.url}
                            target="_blank"
                            underline="hover"
                            color="white"
                        >
                            Open Original
                        </Link>
                    </Stack>
                </Modal>
            </Stack>
            {(author === getUser() ||
                checkPermissions(permissions, Permissions.MANAGE_MESSAGES)) && (
                <IconButton
                    onClick={async () => {
                        await mutateAsync({
                            messageId: message.id,
                            content: message.content,
                            embeds: [],
                        });
                    }}
                >
                    <Clear />
                </IconButton>
            )}
        </Stack>
    );
};

const calculateRatio = (
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
) => {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
};

export const EmbedVideo: React.FC<{ embed: Embed }> = ({ embed }) => {
    const [playing, setPlaying] = useState(false);
    return playing ? (
        <Box sx={{ width: "100%" }}>
            <iframe
                src={embed.video?.url}
                style={{
                    width: calculateRatio(
                        embed.video!.width!,
                        embed.video!.height!,
                        400,
                        embed.video!.height!
                    ).width,
                    height: calculateRatio(
                        embed.video!.width!,
                        embed.video!.height!,
                        400,
                        embed.video!.height!
                    ).height,
                }}
            />
        </Box>
    ) : (
        <Box sx={{ position: "relative", width: "max-content" }}>
            <img
                style={{
                    maxWidth: "300px",
                    display: "block",
                    width: "auto",
                    height: "auto",
                    borderRadius: "10px",
                    cursor: "pointer",
                }}
                alt={embed?.title || "Image"}
                src={embed?.image?.url}
                width={embed?.image?.width}
                height={embed?.image?.height}
            />
            <Box
                sx={{
                    position: "absolute",
                    zIndex: "1000",
                    top: "50%",
                    right: "50%",
                    transform: "translate(50%, -50%)",
                    backgroundColor: "#cccccc",
                    borderRadius: "500px",
                }}
            >
                <IconButton onClick={() => setPlaying(true)}>
                    <PlayArrow />
                </IconButton>
                <Link target="_blank" href={embed.url}>
                    <IconButton>
                        <Launch />
                    </IconButton>
                </Link>
            </Box>
        </Box>
    );
};
