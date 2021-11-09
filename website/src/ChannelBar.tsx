import { List } from "@mui/material";
import { CreateChannelDialogProvider } from "../contexts/CreateChannelContext";
import { CreateInviteDialogProvider } from "../contexts/CreateInviteContext";
import { ServerNavbar } from "./ServerNavbar";

export const ChannelBar: React.FC<{ name?: string }> = ({ children, name }) => {
    return (
        <CreateChannelDialogProvider>
            <CreateInviteDialogProvider>
                <List
                    sx={{
                        borderRight: "1px solid #ccc",
                        height: "100vh",
                        maxHeight: "100vh",
                        overflowY: "hidden",
                        minWidth: "250px",
                        textOverflow: "ellipsis",
                    }}
                    dense
                >
                    {name ? <ServerNavbar name={name} /> : "Channels"}
                    <List
                        sx={{
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
            </CreateInviteDialogProvider>
        </CreateChannelDialogProvider>
    );
};
