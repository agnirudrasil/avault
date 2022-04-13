import { List } from "@mui/material";

export const Messages = () => {
    return (
        <List
            sx={{
                height: "100%",
                mb: 3,
                maxHeight: "100%",
                overflowY: "auto",
            }}
        ></List>
    );
};
