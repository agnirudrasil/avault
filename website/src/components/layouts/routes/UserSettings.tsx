import { GitHub, Api } from "@mui/icons-material";
import {
    List,
    Stack,
    ListSubheader,
    Typography,
    ListItemButton,
    ListItemText,
    Divider,
    IconButton,
} from "@mui/material";
import shallow from "zustand/shallow";
import { useRoutesStore } from "../../../../stores/useRoutesStore";
import { ConfirmLogout } from "../../dialogs/ConfirmLogout";
import { SettingsLayout } from "../../layouts/SettingsLayout";

export const UserSettings: React.FC = ({ children }) => {
    const { setRoute, route } = useRoutesStore(
        state => ({ setRoute: state.setRoute, route: state.route }),
        shallow
    );
    return (
        <SettingsLayout
            nav={
                <List
                    spacing={0.5}
                    component={Stack}
                    sx={{
                        width: "218px",
                        p: "0 6px 60px 20px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                    dense
                >
                    <ListSubheader
                        disableSticky
                        sx={{ bgcolor: "transparent", pl: 0 }}
                        component="div"
                    >
                        <Typography variant="subtitle2">
                            USER SETTINGS
                        </Typography>
                    </ListSubheader>
                    <ListItemButton
                        selected={route === "/user-settings"}
                        onClick={() => setRoute("/user-settings")}
                        sx={{ borderRadius: "5px" }}
                    >
                        <ListItemText primary="My Account" />
                    </ListItemButton>
                    <ListItemButton
                        selected={route === "/user-settings/profile"}
                        sx={{ borderRadius: "5px" }}
                        onClick={() => setRoute("/user-settings/profile")}
                    >
                        <ListItemText primary="User Profile" />
                    </ListItemButton>
                    <ListItemButton
                        selected={route === "/user-settings/authorized-apps"}
                        onClick={() =>
                            setRoute("/user-settings/authorized-apps")
                        }
                        sx={{ borderRadius: "5px" }}
                    >
                        <ListItemText primary="Authorized Apps" />
                    </ListItemButton>
                    <Divider flexItem />
                    <ConfirmLogout />
                    <Divider flexItem />
                    <Stack direction="row">
                        <IconButton
                            size="small"
                            sx={{ ml: "63%" }}
                            href="https://github.com/agnirudrasil/avault"
                            target="_blank"
                        >
                            <GitHub fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            href="/developers/applications"
                            target="_blank"
                        >
                            <Api fontSize="small" />
                        </IconButton>
                    </Stack>
                </List>
            }
        >
            {children}
        </SettingsLayout>
    );
};
