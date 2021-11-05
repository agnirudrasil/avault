import { List } from "@mui/material";
import { CreateChannelDialogProvider } from "../contexts/CreateChannelContext";
import { ServerNavbar } from "./ServerNavbar";

export const ChannelBar: React.FC<{ name?: string }> = ({ children, name }) => {
    return (
        <CreateChannelDialogProvider>
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
                {name ? <ServerNavbar name={name} /> : "Channels"}
                <List
                    sx={{
                        padding: "1rem",
                        maxHeight: "100%",
                        overflowY: "auto",
                        gap: "0.5rem",
                        display: "flex",
                        flexDirection: "column",
                    }}
                    dense
                >
                    {children}
                </List>
            </List>
        </CreateChannelDialogProvider>
    );
};
