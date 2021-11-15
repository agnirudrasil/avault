import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton as MuiListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import { useRoutesStore } from "../../../stores/useRoutesStore";

const Container = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
`;

const ListItemButton = styled(MuiListItemButton)`
    border-radius: 5px;
`;

export const SettingsLayout: React.FC = ({ children }) => {
    const queryClient = useQueryClient();
    const guilds: any = queryClient.getQueryData("guilds");
    const router = useRouter();
    const { setRoute, route } = useRoutesStore();

    return (
        <Container>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    flex: "1 0 234px",
                }}
            >
                <div
                    style={{
                        borderRight: "1px solid #ccc",
                        height: "100vh",
                        flex: "1 0 auto",
                        flexDirection: "row",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "flex-end",
                    }}
                >
                    <List
                        sx={{
                            maxWidth: "218px",
                            width: "218px",
                            padding: "60px 6px 60px 20px",
                        }}
                        dense
                    >
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography variant="button">
                                        {
                                            guilds?.guilds.find(
                                                (g: any) =>
                                                    g.id ===
                                                    router.query.server_id
                                            )?.name
                                        }
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <ListItemButton
                            selected={route === "/settings"}
                            onClick={() => setRoute("/settings")}
                            sx={{ width: "100%" }}
                        >
                            <ListItemText primary="Overview" />
                        </ListItemButton>
                        <ListItemButton
                            selected={route === "/settings/roles"}
                            onClick={() => setRoute("/settings/roles")}
                            sx={{ width: "100%" }}
                        >
                            <ListItemText primary="Roles" />
                        </ListItemButton>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Emoji" />
                        </ListItemButton>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Moderation" />
                        </ListItemButton>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Integrations" />
                        </ListItemButton>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Widget" />
                        </ListItemButton>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Server Template" />
                        </ListItemButton>
                        <Divider sx={{ margin: "1rem 0" }} />
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography variant="button">
                                        User Management
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Member" />
                        </ListItemButton>
                        <ListItemButton sx={{ width: "100%" }}>
                            <ListItemText primary="Invites" />
                        </ListItemButton>
                    </List>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flex: "1 1 800px",
                    overflowY: "auto",
                    maxHeight: "100vh",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        position: "static",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                    }}
                >
                    <main
                        style={{
                            flex: "1 1 auto",
                            maxWidth: "740px",
                            minWidth: "460px",
                            minHeight: "100px",
                            display: "flex",
                        }}
                    >
                        {children}
                    </main>
                    <div
                        style={{
                            marginRight: "21px",
                            position: "relative",
                            flex: "0 0 36px",
                            width: "60px",
                            paddingTop: "60px",
                        }}
                    >
                        <div style={{ position: "fixed" }}>
                            <IconButton
                                onClick={() => setRoute("/")}
                                sx={{ border: "2px solid #ccc" }}
                            >
                                <Close />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};
