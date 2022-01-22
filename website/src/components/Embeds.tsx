import { Link, Modal, Stack } from "@mui/material";
import { useState } from "react";

export const Embeds: React.FC<{ embed: any }> = ({ embed: myEmbed }) => {
    const embed = JSON.parse(myEmbed).image;
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <img
                style={{
                    borderRadius: "10px",
                    maxWidth: "300px",
                    display: "block",
                    width: "auto",
                    height: "auto",
                    cursor: "pointer",
                }}
                onClick={handleOpen}
                alt={embed.title || "Image"}
                src={embed?.url}
                width={embed?.width}
                height={embed?.height}
            />
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
                        src={embed?.url}
                        width={embed?.width}
                        height={embed?.height}
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
        </>
    );
};
