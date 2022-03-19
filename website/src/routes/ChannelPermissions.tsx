import { Add, Clear, Done, FiberManualRecord, Lock } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Snackbar,
    Alert,
    Button,
    Slide,
    Typography,
    Stack,
    AlertTitle,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    ToggleButton,
    ToggleButtonGroup,
    ListSubheader,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";
import produce from "immer";
import { Permissions } from "../permissions";
import { NextRouter, useRouter } from "next/router";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useMemo,
    useState,
} from "react";
import { useUnsaved } from "../../hooks/useUnsaved";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { Android12Switch } from "../components/Form/AndroidSwitch";
import { ChannelSettingsLayout } from "../components/layouts/ChannelSettingsLayout";
import { checkPermissions } from "../compute-permissions";
import { Channel, Overwrites } from "../../types/channels";
import { permissions } from "../permissions";
import { useUpdateChannelPermissions } from "../../hooks/requests/useUpdateChannelPermissions";
import isEqual from "lodash.isequal";
import { Roles, useRolesStore } from "../../stores/useRolesStore";
import { Guild, useGuildsStore } from "../../stores/useGuildsStore";
import React from "react";
import { useDeleteChannelPermissions } from "../../hooks/requests/useDeleteChannelPermissions";

const TransitionComponent = (props: any) => {
    return <Slide {...props} direction="up" unmountOnExit />;
};

const RolesMembersPicker: React.FC<{ roles: Roles[]; guild: Guild }> = ({
    roles,
    guild,
}) => {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const { mutateAsync } = useUpdateChannelPermissions(
        router.query.channel as string
    );

    const handleClose = async (type?: 0 | 1, id?: string) => {
        setAnchorEl(null);
        if (type !== undefined && id !== undefined) {
            await mutateAsync({
                type,
                id,
                allow: "0",
                deny: "0",
            });
        }
    };

    return (
        <ListSubheader sx={{ width: "100%" }} disableSticky>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
                PaperProps={{
                    style: {
                        maxHeight: 48 * 4.5,
                        width: "17ch",
                    },
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <ListSubheader disableSticky>
                    <Typography variant="button" sx={{ userSelect: "none" }}>
                        Roles
                    </Typography>
                </ListSubheader>
                {roles.map(
                    role =>
                        !(router.query.server_id === role.id) && (
                            <MenuItem onClick={() => handleClose(0, role.id)}>
                                <Typography
                                    sx={{
                                        color: `#${role.color.toString(16)}`,
                                    }}
                                >
                                    {role.name}
                                </Typography>
                            </MenuItem>
                        )
                )}
                <ListSubheader disableSticky>
                    <Typography variant="button" sx={{ userSelect: "none" }}>
                        Members
                    </Typography>
                </ListSubheader>
                {Object.keys(guild.members).map(m_id => {
                    const m = guild.members[m_id];
                    return (
                        <MenuItem onClick={() => handleClose(1, m.user.id)}>
                            {m.nick || m.user.username}
                        </MenuItem>
                    );
                })}
            </Menu>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography sx={{ userSelect: "none" }} variant="button">
                    Roles/Members
                </Typography>
                <IconButton onClick={handleClick} size="small">
                    <Add fontSize="small" />
                </IconButton>
            </Stack>
        </ListSubheader>
    );
};

const ToggleSwtich: React.FC<{
    isChannelPrivate: boolean;
    data?: Channel;
    setOgdata: Dispatch<SetStateAction<Channel | undefined>>;
    router: NextRouter;
}> = ({ isChannelPrivate, setOgdata, router, data }) => {
    return (
        <Android12Switch
            checked={isChannelPrivate}
            onChange={e => {
                if (e.target.checked) {
                    setOgdata(p =>
                        produce(p, draft => {
                            if (!draft) return;
                            const ov = draft?.overwrites.findIndex(
                                o => o.id === (router.query.server_id as string)
                            );
                            if (ov >= 0) {
                                draft.overwrites[ov].deny = (
                                    BigInt(draft.overwrites[ov].deny) |
                                    BigInt(Permissions.VIEW_CHANNEL)
                                ).toString();
                            } else {
                                draft.overwrites.push({
                                    id: router.query.server_id as string,
                                    type: 0,
                                    allow: "0",
                                    deny: Permissions.VIEW_CHANNEL,
                                });
                            }
                        })
                    );
                } else {
                    setOgdata(p =>
                        produce(p, draft => {
                            if (!draft) return;
                            const ov = draft?.overwrites.findIndex(
                                o => o.id === (router.query.server_id as string)
                            );
                            if (ov >= 0) {
                                if (
                                    !data?.overwrites.find(
                                        o =>
                                            o.id ===
                                            (router.query.server_id as string)
                                    )
                                ) {
                                    draft.overwrites = draft.overwrites.filter(
                                        o =>
                                            o.id !==
                                            (router.query.server_id as string)
                                    );
                                } else {
                                    draft.overwrites[ov].deny = (
                                        BigInt(draft.overwrites[ov].deny) &
                                        ~BigInt(Permissions.VIEW_CHANNEL)
                                    ).toString();
                                }
                            }
                        })
                    );
                }
            }}
        />
    );
};

export const ChannelPermissions = () => {
    const router = useRouter();

    const roles = useRolesStore(
        state => state[router.query.server_id as string]
    );
    const guild = useGuildsStore(
        state => state[router.query.server_id as string]
    );
    const [selected, setSelected] = useState(router.query.server_id as string);
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const channel = channels?.find(
        c => c.id === (router.query.channel as string)
    );

    const { handleReset, unsaved, ogData, setOgdata } = useUnsaved(channel);
    const isChannelPrivate = useMemo(() => {
        const overwrite = ogData?.overwrites?.find(
            o => o.id === (router.query.server_id as string)
        );
        if (
            overwrite &&
            checkPermissions(BigInt(overwrite.deny), Permissions.VIEW_CHANNEL)
        ) {
            return true;
        }
    }, [ogData]);

    const { isLoading, mutateAsync } = useUpdateChannelPermissions(
        router.query.channel as string
    );

    const { isLoading: deleting, mutateAsync: deleteAsync } =
        useDeleteChannelPermissions(router.query.channel as string);

    const saveFn = async () => {
        const actions = (ogData?.overwrites || []).map(ov => {
            const overwrite = channel?.overwrites?.find(o => o.id === ov.id);
            if (!isEqual(ov, overwrite)) {
                return mutateAsync(ov);
            }
        });

        await Promise.all(actions);
    };

    const returnValue = useCallback(
        (value: bigint): "allow" | "deny" | "none" => {
            const ov = ogData?.overwrites?.find(o => o.id === selected);
            if (ov) {
                if ((BigInt(ov.allow) & value) === value) {
                    return "allow";
                }
                if ((BigInt(ov.deny) & value) === value) {
                    return "deny";
                }
            }

            return "none";
        },
        [ogData, selected]
    );

    const handleOverwriteChange = (value: any | null, permission: bigint) => {
        if (value !== null) {
            setOgdata(p =>
                produce(p, draft => {
                    if (!draft) return;
                    const ov = draft?.overwrites?.findIndex(
                        o => o.id === selected
                    );
                    if (ov !== null && ov !== undefined) {
                        switch (value) {
                            case "allow":
                                if (ov < 0) {
                                    draft.overwrites.push({
                                        id: selected,
                                        type: 0,
                                        allow: permission.toString(),
                                        deny: "0",
                                    });
                                } else {
                                    draft.overwrites[ov].allow = (
                                        BigInt(draft.overwrites[ov].allow) |
                                        permission
                                    ).toString();
                                    draft.overwrites[ov].deny = (
                                        BigInt(draft.overwrites[ov].deny) &
                                        ~permission
                                    ).toString();
                                }
                                break;
                            case "deny":
                                if (ov < 0) {
                                    draft.overwrites.push({
                                        id: selected,
                                        type: 0,
                                        allow: "0",
                                        deny: permission.toString(),
                                    });
                                } else {
                                    draft.overwrites[ov].deny = (
                                        BigInt(draft.overwrites[ov].deny) |
                                        permission
                                    ).toString();

                                    draft.overwrites[ov].allow = (
                                        BigInt(draft.overwrites[ov].allow) &
                                        ~permission
                                    ).toString();
                                }
                                break;
                            case "none":
                                if (ov < 0) {
                                    draft.overwrites = draft.overwrites.filter(
                                        o => o.id !== selected
                                    );
                                } else {
                                    const allowBit =
                                        BigInt(draft.overwrites[ov].allow) &
                                        ~permission;
                                    const denyBit =
                                        BigInt(draft.overwrites[ov].deny) &
                                        ~permission;
                                    if (
                                        allowBit === BigInt(0) &&
                                        denyBit === BigInt(0) &&
                                        selected === router.query.server_id
                                    ) {
                                        if (
                                            !channel?.overwrites.find(
                                                o => o.id === selected
                                            )
                                        ) {
                                            draft.overwrites =
                                                draft.overwrites.filter(
                                                    o => o.id !== selected
                                                );
                                            break;
                                        }
                                    }
                                    draft.overwrites[ov].allow =
                                        allowBit.toString();

                                    draft.overwrites[ov].deny =
                                        denyBit.toString();
                                }
                                break;
                        }
                    }
                })
            );
        }
    };

    const getLabel = (overwrite: Overwrites) => {
        if (overwrite.type === 0) {
            const role = roles?.find(r => r.id === overwrite.id);
            return {
                primary: role?.name || "",
                sx: {
                    color: `#${role?.color.toString(16)}`,
                },
            };
        }
        const member = Object.keys(guild.members).find(m => m === overwrite.id);
        if (member) {
            return {
                primary:
                    guild.members[member].nick ||
                    guild.members[member].user.username,
            };
        }
        return { primary: "" };
    };

    return (
        <ChannelSettingsLayout>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={unsaved}
                TransitionComponent={TransitionComponent}
            >
                <Alert
                    severity="warning"
                    action={
                        <div>
                            <Button
                                size="small"
                                variant="text"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <LoadingButton
                                loading={isLoading}
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    saveFn();
                                }}
                            >
                                Save
                            </LoadingButton>
                        </div>
                    }
                >
                    You have unsaved changes!
                </Alert>
            </Snackbar>
            <div
                style={{
                    minWidth: "740px",
                    width: "100%",
                    padding: "60px 10px 0 20px",
                    height: "100%",
                    maxHeight: "100vh",
                    overflow: "auto",
                }}
            >
                <Stack>
                    <Typography
                        variant="h6"
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        Channel Permissions
                    </Typography>
                    <Typography
                        style={{ userSelect: "none", marginBottom: "30px" }}
                    >
                        Use permissions to customize who can do what in this
                        channel.
                    </Typography>
                </Stack>
                <Alert
                    icon={<Lock fontSize="inherit" />}
                    severity="info"
                    color="info"
                    action={
                        <ToggleSwtich
                            data={channel}
                            setOgdata={setOgdata}
                            isChannelPrivate={Boolean(isChannelPrivate)}
                            router={router}
                        />
                    }
                >
                    <AlertTitle sx={{ userSelect: "none" }}>
                        Private Channel
                    </AlertTitle>
                    By making a channel private only select members and roles
                    will be able to view this channel
                </Alert>
                <Divider sx={{ margin: "30px 0" }} />
                <Typography
                    variant="h6"
                    style={{ userSelect: "none", marginBottom: "30px" }}
                >
                    Advanced Permissions
                </Typography>
                <Stack gap="1rem" direction={"row"}>
                    <List
                        subheader={
                            <RolesMembersPicker roles={roles} guild={guild} />
                        }
                        dense
                    >
                        {channel?.overwrites.map(
                            overwrite =>
                                overwrite.id !== router.query.server_id && (
                                    <ListItemButton
                                        selected={selected === overwrite.id}
                                        onClick={() =>
                                            setSelected(overwrite.id)
                                        }
                                    >
                                        <ListItemText
                                            {...getLabel(overwrite)}
                                        />
                                    </ListItemButton>
                                )
                        )}
                        <ListItemButton
                            selected={selected === router.query.server_id}
                            onClick={() =>
                                setSelected(router.query.server_id as string)
                            }
                        >
                            <ListItemText primary={"@everyone"} />
                        </ListItemButton>
                    </List>
                    <List style={{ width: "100%" }}>
                        {permissions.map(({ title, value, permission }) => (
                            <ListItem disableGutters sx={{ width: "100%" }}>
                                <ListItemText
                                    primary={title}
                                    secondary={permission}
                                />
                                <ListItemSecondaryAction>
                                    <ToggleButtonGroup
                                        value={returnValue(BigInt(value))}
                                        onChange={(_, v) => {
                                            handleOverwriteChange(
                                                v,
                                                BigInt(value)
                                            );
                                        }}
                                        exclusive
                                        size="small"
                                    >
                                        <ToggleButton
                                            color="error"
                                            value="deny"
                                        >
                                            <Clear
                                                color="error"
                                                fontSize="small"
                                            />
                                        </ToggleButton>
                                        <ToggleButton color="info" value="none">
                                            <FiberManualRecord
                                                color="info"
                                                fontSize="small"
                                            />
                                        </ToggleButton>
                                        <ToggleButton
                                            color="success"
                                            value="allow"
                                        >
                                            <Done
                                                color="success"
                                                fontSize="small"
                                            />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {router.query.server_id !== selected && (
                            <ListItemButton
                                onClick={async () => {
                                    setSelected(
                                        router.query.server_id as string
                                    );
                                    await deleteAsync(selected);
                                }}
                                disableGutters
                                disabled={deleting}
                                color="error"
                            >
                                <ListItemText
                                    color="error"
                                    primary={
                                        <Typography color="error">
                                            Delete Permission
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        )}
                    </List>
                </Stack>
            </div>
        </ChannelSettingsLayout>
    );
};
