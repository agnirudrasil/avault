import {
    AddCircle,
    CheckBox,
    CreateNewFolder,
    Edit,
    ExitToApp,
    PersonAdd,
    Settings,
} from "@mui/icons-material";
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useLeaveServer } from "../../hooks/requests/useLeaveServer";
import { useCreateChannel } from "../../hooks/useCreateChannel";
import { useCreateInvite } from "../../hooks/useCreateInvite";
import { usePermssions } from "../../hooks/usePermissions";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { useRoutesStore } from "../../stores/useRoutesStore";
import { checkPermissions } from "../compute-permissions";
import { Permissions } from "../permissions";
import { EditServerProfileDialog } from "./dialogs/EditServerProfileDialog";

const MyMenuItems: React.FC<{ lable: string; onClick?: () => any }> = ({
    lable,
    onClick,
    children,
}) => {
    return (
        <MenuItem sx={{ minWidth: "250px" }} onClick={onClick}>
            <ListItemText primary={lable} />
            <ListItemIcon>{children}</ListItemIcon>
        </MenuItem>
    );
};

const MyMenu: React.FC<{
    anchorEl: null | HTMLElement;
    handleClose: () => any;
}> = ({ handleClose, anchorEl }) => {
    const { createChannel } = useCreateChannel();
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);
    const routeSetter = useRoutesStore(state => state.setRoute);

    const createChannelHandler = (type: any) => {
        createChannel({ guild_id: router.query.server_id as string, type });
    };
    const removeGuild = useGuildsStore(state => state.removeGuild);
    const { createInvite } = useCreateInvite();
    const { mutateAsync } = useLeaveServer(() => {});
    const { permissions, guild, guildMember } = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
                elevation: 0,
                sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    width: "max-content",
                },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
            {checkPermissions(
                permissions,
                Permissions.CREATE_INSTANT_INVITE
            ) && (
                <MyMenuItems
                    onClick={() => createInvite()}
                    lable="Invite People"
                >
                    <PersonAdd />
                </MyMenuItems>
            )}
            {(checkPermissions(permissions, Permissions.MANAGE_GUILD) ||
                checkPermissions(permissions, Permissions.MANAGE_ROLES)) && (
                <MyMenuItems
                    onClick={() => {
                        routeSetter(`/settings`);
                    }}
                    lable="Server Settings"
                >
                    <Settings />
                </MyMenuItems>
            )}
            {checkPermissions(permissions, Permissions.MANAGE_CHANNELS) && [
                <MyMenuItems
                    key="create-channel"
                    onClick={() => createChannelHandler("guild_text")}
                    lable="Create Channel"
                >
                    <AddCircle />
                </MyMenuItems>,
                <MyMenuItems
                    key="create-category"
                    onClick={() => createChannelHandler("guild_category")}
                    lable="Create Category"
                >
                    <CreateNewFolder />
                </MyMenuItems>,
            ]}
            <Divider />
            {checkPermissions(permissions, Permissions.CHANGE_NICKNAME) && (
                <MyMenuItems
                    onClick={() => setOpen(true)}
                    lable="Edit Server Profile"
                >
                    <Edit />
                </MyMenuItems>
            )}
            <MyMenuItems lable="Hide Muted Channels">
                <CheckBox />
            </MyMenuItems>
            {!(guild.owner_id === guildMember?.user?.id) && [
                <Divider key="divider-1" />,
                <MyMenuItems
                    key="leave-server"
                    onClick={async () => {
                        const id = router.query.server_id as string;
                        await mutateAsync(id);
                        removeGuild(id);
                        router.replace("/channels/@me");
                    }}
                    lable="Leave Server"
                >
                    <ExitToApp />
                </MyMenuItems>,
            ]}
            <EditServerProfileDialog
                open={open}
                onClose={() => setOpen(false)}
            />
        </Menu>
    );
};

export default MyMenu;
