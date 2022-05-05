import {
    AttachFile,
    Audiotrack,
    Download,
    KeyboardArrowDown,
    KeyboardArrowRight,
} from "@mui/icons-material";
import {
    CardHeader,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    LinearProgress,
    Link,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import { calculateAspectRatioFit } from "../../aspect-ratio";
import { bytesToSize } from "../../bytes-to-size";
import { TextViewer } from "./TextViewer";

const AttachmentImage: React.FC<{ attachment: any }> = ({ attachment }) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(true);

    const { width, height } = calculateAspectRatioFit(
        attachment.width,
        attachment.height,
        300,
        attachment.height
    );

    return (
        <>
            <Dialog maxWidth="lg" open={open} onClose={() => setOpen(false)}>
                <DialogContent
                    sx={{
                        p: 2,
                        pb: 0,
                        m: 0,
                        width: "max-content",
                        height: "max-content",
                    }}
                >
                    <img
                        alt="Message Attachment"
                        key={attachment.id}
                        src={attachment.url}
                        style={{
                            backgroundImage: `url(/loading.gif)`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Link color="#fff" href={attachment.url} target="_blank">
                        Open Original
                    </Link>
                </DialogActions>
            </Dialog>
            <Stack>
                <Typography
                    sx={{ cursor: "pointer", color: "white" }}
                    component={Link}
                    underline="hover"
                    variant="body2"
                    onClick={() => setVisible(p => !p)}
                >
                    <span>{attachment.filename}</span>
                    <Typography
                        sx={{
                            verticalAlign: "middle",
                            display: "inline-block",
                        }}
                        component="span"
                        variant="body2"
                    >
                        {visible ? (
                            <KeyboardArrowDown fontSize="small" />
                        ) : (
                            <KeyboardArrowRight fontSize="small" />
                        )}
                    </Typography>
                </Typography>
                <Collapse in={visible}>
                    <img
                        alt="Message Attachment Large"
                        onClick={() => setOpen(true)}
                        loading="lazy"
                        key={attachment.id}
                        src={attachment.url}
                        style={{
                            cursor: "pointer",
                            width,
                            height,
                            boxShadow: theme.shadows[3],
                            backgroundImage: `url(/loading.gif)`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                    />
                </Collapse>
            </Stack>
        </>
    );
};

export const AudioFile: React.FC<{ attachment: any }> = ({ attachment }) => {
    return (
        <Paper
            variant="outlined"
            sx={{ width: "max-content", maxWidth: "500px" }}
        >
            <CardHeader
                avatar={<Audiotrack />}
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
                subheader={
                    <Stack sx={{ width: "100%" }}>
                        {bytesToSize(attachment.size)}
                        <audio controls src={attachment.url}></audio>
                    </Stack>
                }
                action={
                    <IconButton href={attachment.url} target="_blank">
                        <Download />
                    </IconButton>
                }
            />
        </Paper>
    );
};

export const Attachments: React.FC<{ attachment: any }> = ({ attachment }) => {
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
        <AttachmentImage attachment={attachment} />
    ) : attachment.content_type.startsWith("video") ? (
        <video width={500} controls src={attachment.url}></video>
    ) : attachment.content_type.startsWith("audio") ? (
        <AudioFile attachment={attachment} />
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
