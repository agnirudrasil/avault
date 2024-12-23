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
import { useDeleteGuild } from "../../../../hooks/requests/useDeleteGuild";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { useRoutesStore } from "../../../../stores/useRoutesStore";
import { SettingsLayout } from "../../layouts/SettingsLayout";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { usePermssions } from "../../../../hooks/usePermissions";

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
            selected={myRoute === `/guild-settings${route}`}
            onClick={() => setRoute("/guild-settings" + route)}
            sx={{ borderRadius: "5px" }}
        >
            <ListItemText primary={title} />
        </ListItemButton>
    );
};

export const GuildSettingsLayout: React.FC = ({ children }) => {
    const router = useRouter();
    const setRoute = useRoutesStore(state => state.setRoute);
    const { name } = useGuildsStore(
        state => state.guildPreview[router.query.guild as string]
    );
    const { mutateAsync } = useDeleteGuild();
    const { permissions, guildMember } = usePermssions(
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
                        Permissions.MANAGE_GUILD
                    ) && <RouteItem title="Overview" route="" />}
                    {checkPermissions(
                        permissions,
                        Permissions.MANAGE_ROLES
                    ) && <RouteItem title="Roles" route="/roles" />}
                    {checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ) && <RouteItem title="Emoji" route="/emoji" />}
                    {/* <RouteItem title="Audit Log" route="/audit-logs" /> */}
                    {/* <RouteItem
                        title="Server Template"
                        route="/server-template"
                    />
                    <RouteItem
                        title="Custom Invite Link"
                        route="/custom-link"
                    /> */}
                    <Divider />
                    <ListSubheader
                        disableSticky
                        sx={{ bgcolor: "transparent", pl: 0 }}
                        component="div"
                    >
                        <Typography variant="button">
                            User management
                        </Typography>
                    </ListSubheader>
                    {/* <RouteItem title="Members" route="/members" /> */}
                    {/* <RouteItem title="Invites" route="/invites" /> */}
                    {checkPermissions(permissions, Permissions.BAN_MEMBERS) && (
                        <RouteItem title="Bans" route="/bans" />
                    )}
                    <Divider />
                    {guildMember.is_owner && (
                        <ListItemButton
                            onClick={async () => {
                                setRoute("/");
                                router.replace("/channels/@me");
                                await mutateAsync(router.query.guild as string);
                            }}
                            sx={{ borderRadius: "5px" }}
                        >
                            <ListItemText primary="Delete Server" />
                        </ListItemButton>
                    )}
                </List>
            }
        >
            {children}
        </SettingsLayout>
    );
};
