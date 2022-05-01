import { Divider, Menu, Typography, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import { useCreateInvite } from "../../../hooks/useCreateInvite";
import { usePermssions } from "../../../hooks/usePermissions";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { checkPermissions } from "../../compute-permissions";
import { ContextMenuBaseProps, ContextMenuShape } from "./types";
import { NestedMenuItem } from "./NestedMenuItem";
import { StyledMenuItem } from "./StyledMenuItem";
import { Permissions } from "../../permissions";
import { EditServerProfileDialog } from "../dialogs/EditServerProfileDialog";
import { useCreateChannel } from "../../../hooks/useCreateChannel";
import { copyToClipboard } from "../../copy";
import { useLeaveServer } from "../../../hooks/requests/useLeaveServer";
import { useRouter } from "next/router";

type Props = ContextMenuBaseProps & {
    guild: string;
    isUnread: boolean;
};

export const GuildItemContextMenu: React.FC<Props> = ({
    contextMenu,
    handleClose,
    guild,
    isUnread,
}) => {
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);
    const firstChannel = useChannelsStore(state => state.getFirstGuildChannel)(
        guild
    );
    const { permissions, guildMember } = usePermssions(
        guild,
        firstChannel?.id || ""
    );

    const theme = useTheme();
    const { createInvite } = useCreateInvite();
    const { createChannel } = useCreateChannel();
    const { mutateAsync } = useLeaveServer(() => {
        router.replace("/channels/@me");
    });

    const menuObject = useMemo<ContextMenuShape[][]>(
        () => [
            [
                {
                    label: "Mark As Read",
                    visible: true,
                    action: () => {
                        console.log("Read");
                    },
                    disabled: !isUnread,
                },
            ],
            [
                {
                    label: "Invite People",
                    visible: checkPermissions(
                        permissions,
                        Permissions.CREATE_INSTANT_INVITE
                    ),
                    color: theme.palette.primary.dark,
                    action: () => {
                        createInvite({ channel_id: firstChannel?.id || "" });
                    },
                },
            ],
            [
                {
                    label: "Server Settings",
                    visible: checkPermissions(
                        permissions,
                        Permissions.MANAGE_GUILD
                    ),
                    action: () => {},
                    children: [
                        {
                            label: "Overview",
                            visible: checkPermissions(
                                permissions,
                                Permissions.MANAGE_GUILD
                            ),
                            action: () => {},
                        },
                    ],
                },
                {
                    label: "Edit Server Profile",
                    visible: checkPermissions(
                        permissions,
                        Permissions.CHANGE_NICKNAME
                    ),
                    action: () => {
                        setOpen(true);
                    },
                },
            ],
            [
                {
                    label: "Leave Server",
                    visible: !guildMember.is_owner,
                    action: async () => {
                        await mutateAsync(guild);
                    },
                    color: theme.palette.error.dark,
                },
            ],
            [
                {
                    label: "Create Category",
                    visible: checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ),
                    action: () => {
                        createChannel({
                            type: "GUILD_CATEGORY",
                            guild_id: guild,
                        });
                    },
                },
                {
                    label: "Create Channel",
                    visible: checkPermissions(
                        permissions,
                        Permissions.MANAGE_CHANNELS
                    ),
                    action: () => {
                        createChannel({
                            type: "GUILD_TEXT",
                            guild_id: guild,
                        });
                    },
                },
            ],
            [
                {
                    label: "Copy ID",
                    visible: true,
                    action: () => {
                        copyToClipboard(guild);
                    },
                },
            ],
        ],
        [permissions]
    );

    return (
        <div>
            <Menu
                open={contextMenu !== null}
                onClose={(e: any) => {
                    if (e.stopPropagation) e.stopPropagation();
                    handleClose();
                }}
                anchorReference="anchorPosition"
                sx={{}}
                PaperProps={{
                    variant: "outlined",
                    elevation: 1,
                    sx: {
                        padding: 1,
                    },
                }}
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                {menuObject.map((menuGroup, i, array) => {
                    const menuItems: ContextMenuShape[] = menuGroup.filter(
                        item => item.visible
                    );
                    return (
                        menuItems.length > 0 && (
                            <div>
                                {menuItems.map(
                                    (
                                        {
                                            label,
                                            disabled,
                                            color,
                                            icon,
                                            action,
                                            children,
                                        },
                                        i
                                    ) =>
                                        children ? (
                                            <NestedMenuItem
                                                key={`${i}-${label}`}
                                                parentMenuOpen={
                                                    contextMenu !== null
                                                }
                                                label={
                                                    <Typography variant="body2">
                                                        {label}
                                                    </Typography>
                                                }
                                            >
                                                {children.map(
                                                    (menuItem, index) => (
                                                        <StyledMenuItem
                                                            key={`${index}-${label}`}
                                                            sx={{
                                                                color: menuItem.color,
                                                                "&:hover": {
                                                                    color: "white",
                                                                    background:
                                                                        color,
                                                                },
                                                            }}
                                                            onClick={async e => {
                                                                e.stopPropagation();
                                                                await action(
                                                                    handleClose
                                                                );
                                                                handleClose();
                                                            }}
                                                            disabled={
                                                                menuItem.disabled
                                                            }
                                                        >
                                                            <Typography variant="body2">
                                                                {menuItem.label}
                                                            </Typography>
                                                            {menuItem.icon &&
                                                                menuItem.icon}
                                                        </StyledMenuItem>
                                                    )
                                                )}
                                            </NestedMenuItem>
                                        ) : (
                                            <StyledMenuItem
                                                key={`${i}-${label}`}
                                                sx={{
                                                    color,
                                                    "&:hover": {
                                                        color: "white",
                                                        background: color,
                                                    },
                                                }}
                                                onClick={async e => {
                                                    e.stopPropagation();
                                                    await action(handleClose);
                                                    handleClose();
                                                }}
                                                disabled={disabled}
                                            >
                                                <Typography variant="body2">
                                                    {label}
                                                </Typography>
                                                {icon && icon}
                                            </StyledMenuItem>
                                        )
                                )}
                                {i !== array.length - 1 && <Divider />}
                            </div>
                        )
                    );
                })}
            </Menu>
            <EditServerProfileDialog
                guild={guild}
                onClose={() => setOpen(false)}
                open={open}
            />
        </div>
    );
};
