import { Add } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useState } from "react";
import { useAddGuildMemberRole } from "../../hooks/requests/useAddGuildMemberRole";
import { useBanMember } from "../../hooks/requests/useBanMember";
import { useDeleteGuildMemberRole } from "../../hooks/requests/useDeleteGuildMemberRole";
import { useKickMember } from "../../hooks/requests/useKickMember";
import { usePermssions } from "../../hooks/usePermissions";
import { useGuildsStore } from "../../stores/useGuildsStore";
import { Roles, useRolesStore } from "../../stores/useRolesStore";
import { GuildMembers } from "../../stores/useUserStore";
import { DefaultProfilePic } from "../components/DefaultProfilePic";
import { GuildMember } from "../components/GuildMember";
import { SettingsLayout } from "../components/layouts/SettingsLayout";
import { checkPermissions } from "../compute-permissions";
import { Permissions } from "../permissions";
import { rolesSort } from "../sort-roles";
import { getUser } from "../user-cache";

export const SettingsMembers = () => {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const roles = useRolesStore(
        state => state[router.query.server_id as string]
    );
    const [selRole, setSelRole] = useState<string>(
        router.query.server_id as string
    );
    const role = roles.find(r => r.id === selRole);

    const members = useGuildsStore(
        state => state[router.query.server_id as string].members
    );

    return (
        <SettingsLayout>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                {roles.map(r => (
                    <MenuItem
                        sx={{ color: `#${r.color.toString(16)}` }}
                        onClick={() => {
                            setSelRole(r.id);
                            handleClose();
                        }}
                    >
                        {r?.name}
                    </MenuItem>
                ))}
            </Menu>
            <Box
                sx={{ paddingTop: "60px", paddingLeft: "10px", width: "100%" }}
            >
                <Typography variant="h5">Server Members</Typography>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography color="GrayText" variant="caption">
                        {Object.keys(members).length} Members
                    </Typography>
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        <Typography color="GrayText" variant="caption">
                            Display Role:{" "}
                        </Typography>
                        <Typography
                            onClick={handleClick}
                            sx={{
                                cursor: "pointer",
                                color: `#${role?.color.toString(16)}`,
                            }}
                            variant="caption"
                        >
                            {role?.name}
                        </Typography>
                    </Stack>
                </Stack>
                <Divider />
                <List>
                    {Object.keys(members).map(mID => {
                        const m = members[mID];
                        return (
                            (selRole === router.query.server_id ||
                                m.roles.includes(selRole)) && (
                                <Member roles={roles} m={m} />
                            )
                        );
                    })}
                </List>
            </Box>
        </SettingsLayout>
    );
};

const Member: React.FC<{ m: GuildMembers; roles: Roles[] }> = ({
    m,
    roles,
}) => {
    const router = useRouter();

    const { permissions, memberRoles, guildMember } = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );
    const { mutate: addRole } = useAddGuildMemberRole();
    const { mutate: deleteRole } = useDeleteGuildMemberRole();
    const { mutate: ban } = useBanMember();
    const { mutate: kick } = useKickMember();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const otherMember = useMemo(() => {
        if (m) {
            const myRoles = m.roles?.map((r: any) =>
                roles.find(role => role.id === r)
            ) as Roles[];

            myRoles.sort(rolesSort);

            return myRoles;
        }
        return [];
    }, [roles, m]);

    return (
        <Stack>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {roles.map(
                    r =>
                        r.id !== router.query.server_id &&
                        !m.roles.includes(r.id) &&
                        (guildMember.is_owner ||
                            r.position < memberRoles[0]?.position) && (
                            <MenuItem
                                onClick={() => {
                                    addRole({
                                        guildMember: m,
                                        roleId: r.id,
                                    });
                                }}
                                sx={{
                                    color: `#${r.color.toString(16)}`,
                                }}
                            >
                                {r.name}
                            </MenuItem>
                        )
                )}
            </Menu>
            <ListItemButton key={m.user.id}>
                <ListItemAvatar>
                    <DefaultProfilePic tag={m.user.id} />
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography>
                            <GuildMember id={m.user.id}>
                                {m.nick || m.user.username}
                            </GuildMember>
                        </Typography>
                    }
                    secondary={`@${m.user.username}
                                            ${m.user.tag}`}
                />
                <ListItemSecondaryAction>
                    {(guildMember.is_owner ||
                        memberRoles[0]?.position >= otherMember[0]?.position) &&
                        !m.is_owner &&
                        !(m.user.id === getUser()) &&
                        checkPermissions(
                            permissions,
                            Permissions.BAN_MEMBERS
                        ) && (
                            <Button
                                onClick={() => {
                                    ban({
                                        guildId: router.query
                                            .server_id as string,
                                        memberId: m.user.id,
                                    });
                                }}
                                size="small"
                                color="error"
                            >
                                Ban
                            </Button>
                        )}
                    {(guildMember.is_owner ||
                        otherMember[0]?.position <= memberRoles[0]?.position) &&
                        !(m.user.id === getUser()) &&
                        !m.is_owner &&
                        checkPermissions(
                            permissions,
                            Permissions.KICK_MEMBERS
                        ) && (
                            <Button
                                size="small"
                                color="error"
                                variant="contained"
                                onClick={() => {
                                    kick({
                                        guildId: router.query
                                            .server_id as string,
                                        memberId: m.user.id,
                                    });
                                }}
                            >
                                Kick
                            </Button>
                        )}
                </ListItemSecondaryAction>
            </ListItemButton>
            <Stack sx={{ maxWidth: "100%" }} direction="row" spacing={1}>
                {otherMember.map(r => (
                    <Chip
                        label={r.name}
                        variant="outlined"
                        sx={{
                            color: `#${r.color.toString(16)}`,
                        }}
                        onDelete={
                            !guildMember.is_owner &&
                            r.position >= memberRoles[0].position
                                ? undefined
                                : () => {
                                      deleteRole({
                                          guildMember: m,
                                          roleId: r.id,
                                      });
                                  }
                        }
                    />
                ))}
                <IconButton size={"small"} onClick={handleClick}>
                    <Add />
                </IconButton>
            </Stack>
        </Stack>
    );
};
