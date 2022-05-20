import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slider,
    Stack,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

const ImageEditor: React.FC<{
    image: File;
    open: boolean;
    setOpen: any;
    onChange: any;
    width: number;
    height: number;
}> = ({ image, onChange, open, setOpen, width, height }) => {
    const [scale, setScale] = useState(1);
    const editorRef = useRef(null);
    return (
        <Dialog
            PaperProps={{ sx: { width: "max-content" } }}
            fullWidth
            open={open}
            onClose={() => setOpen(false)}
        >
            <DialogTitle>Edit Image</DialogTitle>
            <DialogContent>
                <Stack>
                    <AvatarEditor
                        ref={editorRef}
                        image={image}
                        width={width}
                        height={height}
                        border={1}
                        color={[255, 255, 255, 0.6]} // RGBA
                        scale={scale}
                        rotate={0}
                    />
                    <Slider
                        value={scale}
                        step={0.01}
                        min={0.1}
                        max={2}
                        marks={[
                            { value: 0.1, label: "10%" },
                            { value: 1, label: "100%" },
                            { value: 2, label: "200%" },
                        ]}
                        onChange={(_, newValue) => setScale(newValue as number)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ bgcolor: "grey.900" }}>
                <Button
                    onClick={() => {
                        setOpen(false);
                    }}
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        if (editorRef && editorRef.current) {
                            onChange(
                                (editorRef.current as AvatarEditor)
                                    .getImageScaledToCanvas()
                                    .toDataURL(image.type, 0.5)
                            );
                        }
                        setOpen(false);
                    }}
                    disableElevation
                    variant="contained"
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const AvatarEditorDialog: React.FC<{
    onChange: (image: string) => any;
    buttonText: string | React.ReactNode;
    width: number;
    height: number;
}> = ({ onChange, buttonText, width, height }) => {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (file) {
            setOpen(true);
        }
    }, [file]);

    return (
        <label>
            <input
                value={""}
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                onChange={e => {
                    if (e.target.files) {
                        setFile(e.target.files[0]);
                    }
                }}
            />
            {buttonText}
            <ImageEditor
                key={`${width}x${height}`}
                width={width}
                height={height}
                open={open}
                setOpen={setOpen}
                onChange={onChange}
                image={file!}
            />
        </label>
    );
};
