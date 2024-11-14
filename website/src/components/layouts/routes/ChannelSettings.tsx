import {
    List,
    Stack,
    ListSubheader,
    Typography,
    ListItemButton,
    ListItemText,
    Divider,
} from "@mui/material";
import { useRouter } from "next/router";
import shallow from "zustand/shallow";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { useRoutesStore } from "../../../../stores/useRoutesStore";
import { SettingsLayout } from "../SettingsLayout";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { usePermssions } from "../../../../hooks/usePermissions";
import { useDeleteChannel } from "../../../../hooks/requests/useDeleteChannel";

const RouteItem: React.FC<{ title: string; route: string }> = ({
    title,
    route,
}) => {
    const { route: myRoute, setRoute } = useRoutesStore(
        state => ({ setRoute: state.setRoute, route: state.route }),
        shallow
    );
    return (
        <ListItemButton
            selected={myRoute === `/channel-settings${route}`}
            onClick={() => setRoute("/channel-settings" + route)}
            sx={{ borderRadius: "5px" }}
        >
            <ListItemText primary={title} />
        </ListItemButton>
    );
};

export const ChannelSettingsLayout: React.FC = ({ children }) => {
    const router = useRouter();
    const setRoute = useRoutesStore(state => state.setRoute);
    const { name } = useGuildsStore(
        state => state.guildPreview[router.query.guild as string]
    );
    const { mutateAsync } = useDeleteChannel();
    const { permissions } = usePermssions(
        router.query.guild as string,
        router.query.channel as string
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
                        <Typography variant="button">{name}</Typography>
                    </ListSubheader>
                    {checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ) && <RouteItem title="Overview" route="" />}
                    {checkPermissions(
                        permissions,
                        (
                            BigInt(Permissions.MANAGE_CHANNELS) |
                            BigInt(Permissions.MANAGE_ROLES)
                        ).toString()
                    ) && <RouteItem title="Permissions" route="/permissions" />}
                    <Divider />
                    {checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ) && (
                        <ListItemButton
                            onClick={async () => {
                                setRoute("/");
                                router.replace(
                                    "/channels/" + router.query.guild
                                );
                                await mutateAsync(
                                    router.query.channel as string
                                );
                            }}
                            sx={{ borderRadius: "5px" }}
                        >
                            <ListItemText primary="Delete Channel" />
                        </ListItemButton>
                    )}
                </List>
            }
        >
            {children}
        </SettingsLayout>
    );
};
