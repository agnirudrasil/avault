import {
    Avatar,
    Divider,
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
    author?: {
        name?: string;
        icon_url?: string;
        url?: string;
    };
    fields?: Fields[];
    timestamp?: string;
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

export const Embeds: React.FC<{ embed: any }> = ({ embed: myEmbed }) => {
    const embed = JSON.parse(myEmbed) as Embed;
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const fields = nestArray(embed.fields);

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                background: "#eee",
                borderRadius: "10px",
                overflow: "hidden",
                width: "min-content",
                padding: "1rem",
                borderLeft: `5px solid #${embed.color?.toString(16) || "000"}`,
            }}
        >
            <Stack spacing={2}>
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
                                            embed.author.url ? "hover" : "none"
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
                        {embed.description}
                    </Typography>
                )}
                <Stack spacing={1}>
                    {fields.map(row => (
                        <Stack direction="row" spacing={2}>
                            {row.map(field => (
                                <Box>
                                    <Typography variant="subtitle2">
                                        {field.name}
                                    </Typography>
                                    <Typography>
                                        <Markdown content={field.value || ""} />
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    ))}
                </Stack>
                {embed.image && (
                    <img
                        style={{
                            maxWidth: "300px",
                            display: "block",
                            width: "auto",
                            height: "auto",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                        onClick={handleOpen}
                        alt={embed?.title || "Image"}
                        src={embed?.image?.url}
                        width={embed?.image?.width}
                        height={embed?.image?.height}
                    />
                )}
                {embed.footer && (
                    <Stack
                        spacing={1}
                        divider={<Divider flexItem orientation="vertical" />}
                        direction="row"
                    >
                        <ListItem sx={{ padding: 0, width: "max-content" }}>
                            {embed.footer.icon_url && (
                                <ListItemAvatar sx={{ minWidth: "32px" }}>
                                    <Avatar
                                        sx={{ width: "24px", height: "24px" }}
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
                            <ListItem sx={{ padding: 0, width: "max-content" }}>
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
                        onClick={handleOpen}
                        alt={embed?.title || "Image"}
                        src={embed?.thumbnail?.url}
                    />
                </Box>
            )}
            <Modal open={open} onClose={handleClose}>
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
                        onClick={handleOpen}
                        alt={embed.title || "Image"}
                        src={embed?.image?.url}
                        width={embed?.image?.width}
                        height={embed?.image?.height}
                    />
                    <Link
                        href={JSON.parse(myEmbed).url}
                        target="_blank"
                        underline="hover"
                        color="white"
                    >
                        Open Original
                    </Link>
                </Stack>
            </Modal>
        </Stack>
    );
};
