import { AttachFile, Delete, Edit, Visibility } from "@mui/icons-material";
import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Attachment } from "./attachment";

export const ImagePreview: React.FC<{
    file: Attachment;
    onDelete: () => any;
    onEdit: (name: string) => any;
}> = ({ file, onDelete }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (file.file.type.startsWith("image/")) {
            const objectUrl = URL.createObjectURL(file.file);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    return (
        <Stack
            spacing={1}
            alignItems="center"
            sx={{
                bgcolor: "background.paper",
                p: 1,
                maxWidth: "min-content",
            }}
        >
            {file.file.type.startsWith("image/") && preview ? (
                <img
                    style={{ minWidth: "100px", maxWidth: 100 }}
                    src={preview}
                />
            ) : (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        width: "100px",
                        height: "100px",
                    }}
                >
                    <AttachFile />
                </Stack>
            )}
            <Typography
                sx={{
                    maxWidth: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                color="GrayText"
            >
                {file.filename || file.file.name}
            </Typography>
            <ButtonGroup color="inherit" size="small" variant="text">
                <Button>
                    <Visibility fontSize="small" />
                </Button>
                <Button>
                    <Edit fontSize="small" />
                </Button>
                <Button onClick={onDelete} color="error">
                    <Delete fontSize="small" />
                </Button>
            </ButtonGroup>
        </Stack>
    );
};
