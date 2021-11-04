import { List } from "@mui/material";

export const ChannelBar: React.FC<{ name?: string }> = ({ children, name }) => {
    return (
        <List
            sx={{
                borderRight: "1px solid #ccc",
                height: "100vh",
                maxHeight: "100vh",
                overflowY: "hidden",
                minWidth: "max-content",
            }}
            dense
        >
            <div
                style={{
                    borderBottom: "1px solid #ccc",
                    width: "100%",
                    padding: "1rem",
                    position: "sticky",
                    top: "0",
                    right: "0",
                }}
            >
                {name || "Channels"}
            </div>

            <List
                sx={{ padding: "1rem", maxHeight: "100%", overflowY: "auto" }}
            >
                {children}
            </List>
        </List>
    );
};
