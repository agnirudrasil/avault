import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { bytesToSize } from "../../bytes-to-size";

export const TextViewer: React.FC<{
    url: string;
    type: string;
    attachment: any;
}> = ({ url, type, attachment }) => {
    const [text, setText] = useState("");
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/proxy?path=${encodeURIComponent(
                url.replace("https", "http")
            )}`,
            {
                credentials: "include",
            }
        )
            .then(async res => {
                setText(await res.text());
            })
            .catch(e => {
                console.error(e);
            });
    }, []);

    const numLines = text.split("\n").length;

    return (
        <Paper sx={{ maxWidth: "80%" }}>
            <Prism
                sx={{
                    maxWidth: "100%",
                }}
                withLineNumbers
                colorScheme="dark"
                language={type as any}
            >
                {expanded ? text : text.split("\n").slice(0, 6).join("\n")}
            </Prism>
            <Stack
                alignItems="center"
                justifyContent="space-between"
                direction="row"
                sx={{ p: 0.5 }}
            >
                <Button
                    size="small"
                    color="inherit"
                    variant="text"
                    onClick={() => setExpanded(expanded => !expanded)}
                    startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                >
                    Expand ({numLines} lines)
                </Button>
                <Stack alignItems="center" direction="row" spacing={1}>
                    <Typography>{attachment.filename}</Typography>
                    <Typography color="GrayText">
                        {bytesToSize(attachment.size)}
                    </Typography>
                </Stack>
            </Stack>
        </Paper>
    );
};
