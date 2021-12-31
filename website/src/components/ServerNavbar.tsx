import {
    AddCircle,
    CheckBox,
    Close,
    CreateNewFolder,
    Edit,
    ExitToApp,
    KeyboardArrowDown,
    PersonAdd,
    Settings,
} from "@mui/icons-material";
import {
    IconButton,
    Typography,
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
            id="basic-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            MenuListProps={{
                "aria-labelledby": "basic-button",
            }}
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
            <EditServerProfileDialog
                open={open}
                onClose={() => setOpen(false)}
            />
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
            {checkPermissions(permissions, Permissions.MANAGE_CHANNELS) && (
                <>
                    <MyMenuItems
                        onClick={() => createChannelHandler("guild_text")}
                        lable="Create Channel"
                    >
                        <AddCircle />
                    </MyMenuItems>
                    <MyMenuItems
                        onClick={() => createChannelHandler("guild_category")}
                        lable="Create Category"
                    >
                        <CreateNewFolder />
                    </MyMenuItems>
                </>
            )}
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
            {!(guild.owner_id === guildMember.user.id) && (
                <>
                    <Divider />
                    <MyMenuItems
                        onClick={async () => {
                            const id = router.query.server_id as string;
                            await mutateAsync(id);
                            removeGuild(id);
                            router.replace("/channels/@me");
                        }}
                        lable="Leave Server"
                    >
                        <ExitToApp />
                    </MyMenuItems>
                </>
            )}
        </Menu>
    );
};

export const ServerNavbar: React.FC<{ name: string }> = ({ name }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return (
        <div
            style={{
                borderBottom: "1px solid #ccc",
                width: "100%",
                padding: "1rem",
                position: "sticky",
                top: "0",
                right: "0",
                display: "flex",
                justifyContent: "space-between",
                gap: "2rem",
                alignItems: "center",
            }}
        >
            <Typography>{name}</Typography>
            <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                {anchorEl ? <Close /> : <KeyboardArrowDown />}
            </IconButton>
            <MyMenu anchorEl={anchorEl} handleClose={() => setAnchorEl(null)} />
        </div>
    );
};
