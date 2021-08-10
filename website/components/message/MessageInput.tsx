import { Paper, IconButton, InputBase, Divider } from "@material-ui/core";
import { EmojiEmotions, Gif, AddCircle, Send } from "@material-ui/icons";
import React from "react";

export const MessageInput: React.FC = () => {
    return (
        <Paper
            component="form"
            sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: "calc(100% - 2rem)",
                margin: "0 1rem",
                borderRadius: "500px",
            }}
            elevation={0}
        >
            <IconButton sx={{ p: "10px" }} aria-label="add">
                <AddCircle />
            </IconButton>
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Message #channel"
                inputProps={{ "aria-label": "Message" }}
                multiline
            />
            <IconButton color="primary" sx={{ p: "10px" }} aria-label="gifs">
                <Gif />
            </IconButton>
            <IconButton type="submit" sx={{ p: "10px" }} aria-label="emojis">
                <EmojiEmotions />
            </IconButton>
            <IconButton type="submit" sx={{ p: "10px" }} aria-label="emojis">
                <Send />
            </IconButton>
        </Paper>
    );
};
