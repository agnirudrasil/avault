import { AttachFile, Download } from "@mui/icons-material";
import {
    CardHeader,
    IconButton,
    LinearProgress,
    Link,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { bytesToSize } from "../../bytes-to-size";
import { TextViewer } from "./TextViewer";

export const Attachments: React.FC<{ attachment: any }> = ({ attachment }) => {
    const theme = useTheme();

    return attachment.processing ? (
        <Paper variant="outlined" sx={{ width: "500px", maxWidth: "500px" }}>
            <CardHeader
                avatar={<AttachFile />}
                title={
                    <Link
                        sx={{ color: "primary.dark" }}
                        target="_blank"
                        href={attachment.url}
                    >
                        <Typography
                            sx={{
                                maxWidth: "350px",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {attachment.file.name}
                        </Typography>
                    </Link>
                }
                subheader={
                    <Stack sx={{ width: "100%" }}>
                        <Typography variant="caption">Processing</Typography>
                        <LinearProgress />
                    </Stack>
                }
            />
        </Paper>
    ) : attachment.content_type.startsWith("image") ? (
        <img
            loading="lazy"
            key={attachment.id}
            src={attachment.url}
            style={{
                maxWidth: "300px",
                borderRadius: "5px",
                boxShadow: theme.shadows[3],
            }}
        />
    ) : attachment.content_type.startsWith("text") ? (
        <TextViewer
            type={attachment.content_type.split("/")[1]}
            url={attachment.url}
            attachment={attachment}
        />
    ) : (
        <Paper
            variant="outlined"
            sx={{ width: "max-content", maxWidth: "500px" }}
        >
            <CardHeader
                avatar={<AttachFile />}
                title={
                    <Link
                        sx={{ color: "primary.dark" }}
                        target="_blank"
                        href={attachment.url}
                    >
                        <Typography
                            sx={{
                                maxWidth: "350px",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {attachment.filename}
                        </Typography>
                    </Link>
                }
                subheader={bytesToSize(attachment.size)}
                action={
                    <IconButton href={attachment.url} target="_blank">
                        <Download />
                    </IconButton>
                }
            />
        </Paper>
    );
};
