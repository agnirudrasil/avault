import { Add, Clear, DragIndicator, Search } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Slide,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import produce from "immer";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from "react-beautiful-dnd";
import { useQueryClient } from "react-query";
import { useCreateRoles } from "../../hooks/requests/useCreateRole";
import { useDeleteRole } from "../../hooks/requests/useDeleteRole";
import { useEditRole } from "../../hooks/requests/useEditRole";
import { useGetRole } from "../../hooks/requests/useGetRole";
import { useGetRoles } from "../../hooks/requests/useGetRoles";
import { useUnsaved } from "../../hooks/useUnsaved";
import { ColorPicker } from "../components/ColorPicker";
import { Android12Switch } from "../components/Form/AndroidSwitch";
import { SettingsLayout } from "../components/layouts/SettingsLayout";
import { permissions } from "../permissions";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export const SettingsRoles = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { mutateAsync, isLoading: isCreating } = useCreateRoles();
    const { data, isLoading } = useGetRoles(router.query.server_id as string);
    const [selected, setSelected] = useState<string>(
        router.query.server_id as string
    );
    const { handleReset, ogData, setOgdata, unsaved } = useUnsaved(
        data && data.roles
    );

    if (isLoading || !data || !ogData) {
        return (
            <div>
                <LinearProgress />
            </div>
        );
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const dragCard = ogData[result.source.index];
        setOgdata((data: any) =>
            produce(data, (draft: any) => {
                draft.splice(result.source.index, 1);
                draft.splice(result.destination!.index, 0, dragCard);
            })
        );
    };

    const createRole = async () => {
        const [{ role }] = await mutateAsync(router.query.server_id as string);
        queryClient.setQueryData(
            ["roles", router.query.server_id as string],
            existingRoles =>
                produce(existingRoles, (draft: any) => {
                    draft.roles.splice(draft.roles.length - 1, 0, role);
                })
        );
        setSelected(role.id);
    };

    return (
        <SettingsLayout>
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
                                // loading={isUpdating}
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    // saveFn(ogData);
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
                    display: "flex",
                    height: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                }}
            >
                <DragDropContext onDragEnd={onDragEnd}>
                    <List
                        sx={{
                            padding: "60px 10px 0 10px",
                            minHeight: "100vh",
                            borderRight: "2px solid #ccc",
                            width: "max-content",
                            minWidth: "218px",
                            height: "100%",
                            overflowY: "auto",
                            position: "static",
                            top: 0,
                        }}
                        subheader={
                            <ListSubheader>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="button">
                                        ROLES
                                    </Typography>
                                    <IconButton
                                        onClick={createRole}
                                        disabled={isCreating}
                                        size="small"
                                    >
                                        <Add />
                                    </IconButton>
                                </div>
                            </ListSubheader>
                        }
                        dense
                    >
                        <Droppable droppableId="droppable">
                            {provided => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {ogData
                                        .filter(
                                            (i: any) =>
                                                i.id !== router.query.server_id
                                        )
                                        .map((role: any, index: number) => (
                                            <Draggable
                                                draggableId={role.id}
                                                index={index}
                                                key={role.id}
                                                isDragDisabled={
                                                    role.id ===
                                                    router.query.server_id
                                                }
                                            >
                                                {provided => (
                                                    <ListItemButton
                                                        disableRipple
                                                        ref={provided.innerRef}
                                                        {...provided.dragHandleProps}
                                                        {...provided.draggableProps}
                                                        disableTouchRipple
                                                        selected={
                                                            selected === role.id
                                                        }
                                                        onClick={() =>
                                                            setSelected(role.id)
                                                        }
                                                        sx={{
                                                            borderRadius:
                                                                "10px",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                background:
                                                                    "#" +
                                                                    role.color.toString(
                                                                        16
                                                                    ),
                                                                width: "10px",
                                                                height: "10px",
                                                            }}
                                                        >
                                                            <></>
                                                        </Avatar>
                                                        <ListItemText
                                                            sx={{
                                                                color:
                                                                    "#" +
                                                                    role.color.toString(
                                                                        16
                                                                    ),
                                                            }}
                                                            primary={role.name}
                                                        />
                                                    </ListItemButton>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <ListItemButton
                            disableRipple
                            disableTouchRipple
                            selected={selected === router.query.server_id}
                            onClick={() =>
                                setSelected(router.query.server_id as string)
                            }
                            sx={{
                                borderRadius: "10px",
                                gap: "0.5rem",
                            }}
                        >
                            <Avatar
                                sx={{
                                    background: "#ccc",
                                    width: "10px",
                                    height: "10px",
                                }}
                            >
                                <></>
                            </Avatar>
                            <ListItemText primary="@everyone" />
                        </ListItemButton>
                    </List>
                </DragDropContext>
                <RolesDisplay
                    setSelected={setSelected}
                    key={selected}
                    roleId={selected}
                    guildId={router.query.server_id as string}
                />
            </div>
        </SettingsLayout>
    );
};

const TransitionComponent = (props: any) => {
    return <Slide {...props} direction="up" unmountOnExit />;
};

export const RolesDisplay: React.FC<{
    roleId: string;
    guildId: string;
    setSelected: (id: string) => any;
}> = ({ roleId, guildId, setSelected }) => {
    const { data, isLoading } = useGetRole(guildId, roleId);
    const queryClient = useQueryClient();
    const [permsQuery, setPermsQuery] = useState<string>("");
    const { mutateAsync, isLoading: isUpdating } = useEditRole(guildId, roleId);
    const { mutateAsync: deleteRole, isLoading: deleteing } = useDeleteRole(
        guildId,
        roleId
    );
    const [value, setValue] = useState(guildId === roleId ? 1 : 0);
    const { ogData, setOgdata, handleReset, unsaved } = useUnsaved(
        data && data?.role
    );

    const saveFn = async (data: Object) => {
        await mutateAsync(data);
        queryClient.setQueryData(["roles", guildId, roleId], existingRole =>
            produce(existingRole, (draft: any) => {
                Object.assign(draft.role, data);
            })
        );
        queryClient.setQueryData(["roles", guildId], existingRoles =>
            produce(existingRoles, (draft: any) => {
                draft.roles.forEach((role: any) => {
                    if (role.id === roleId) {
                        Object.assign(role, data);
                    }
                });
            })
        );
    };

    const handleDelete = async () => {
        await deleteRole();
        queryClient.setQueryData(["roles", guildId], existingRoles =>
            produce(existingRoles, (draft: any) => {
                draft.roles = draft.roles.filter(
                    (role: any) => role.id !== roleId
                );
            })
        );
        queryClient.invalidateQueries(["roles", guildId, roleId]);
        setSelected(guildId);
    };

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (isLoading || !data || !ogData) {
        return (
            <div>
                <LinearProgress />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "60px 0 0 30px" }}>
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
                                loading={isUpdating}
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    saveFn(ogData);
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
            <Typography variant="h6">Edit Role - {ogData.name}</Typography>
            <br />
            <Tabs value={value} onChange={handleChange}>
                <Tab disabled={guildId === roleId} label="Display" />
                <Tab label="Permissions" />
                <Tab disabled={guildId === roleId} label="Manage Members" />
            </Tabs>
            <TabPanel value={value} index={0}>
                <Typography variant="button">ROLE NAME*</Typography>
                <TextField
                    value={ogData.name}
                    fullWidth
                    required
                    inputProps={{ readOnly: guildId === roleId }}
                    onChange={e => {
                        setOgdata((prev: any) =>
                            produce(prev, (draft: any) => {
                                draft.name = e.target.value;
                            })
                        );
                    }}
                />
                <br />
                <Divider />
                <br />
                <Typography variant="button">ROLE COLOR*</Typography>
                <Typography variant="body2">
                    Members use the color of the highest role they have on the
                    roles list
                </Typography>
                <ColorPicker
                    value={ogData.color}
                    onChange={color => {
                        setOgdata((prev: any) =>
                            produce(prev, (draft: any) => {
                                draft.color = color;
                            })
                        );
                    }}
                />
                <br />
                <Divider />
                <br />
                <List sx={{ width: "100%" }} disablePadding>
                    <ListItem disableGutters sx={{ width: "100%" }}>
                        <ListItemText
                            primary="Allow anyone to @mention this role"
                            secondary={`Note: Members with the "Mention @everyone, @here and All Roles" permission will always be able to ping this role`}
                        />
                        <ListItemSecondaryAction>
                            <Android12Switch
                                onChange={e => {
                                    setOgdata((prev: any) =>
                                        produce(prev, (draft: any) => {
                                            draft.mentionable =
                                                e.target.checked;
                                        })
                                    );
                                }}
                                checked={ogData.mentionable}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <br />
                    <LoadingButton
                        disableElevation
                        fullWidth
                        loading={deleteing}
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete Role
                    </LoadingButton>
                </List>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <TextField
                    fullWidth
                    placeholder="Search Permissions"
                    value={permsQuery}
                    onChange={e => {
                        setPermsQuery(e.target.value.toLowerCase());
                    }}
                    InputProps={{
                        endAdornment: !permsQuery ? (
                            <InputAdornment position="end">
                                <Search />
                            </InputAdornment>
                        ) : (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setPermsQuery("")}>
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <List sx={{ width: "100%" }} disablePadding>
                    {permissions
                        .filter(permission =>
                            permission.title.toLowerCase().match(permsQuery)
                        )
                        .map(permission => (
                            <ListItem disableGutters sx={{ width: "100%" }}>
                                <ListItemText
                                    primary={permission.title}
                                    secondary={permission.description}
                                />
                                <ListItemSecondaryAction>
                                    <Android12Switch
                                        checked={Boolean(
                                            BigInt(ogData.permissions || "0") &
                                                permission.bit
                                        )}
                                        onChange={e => {
                                            setOgdata((prev: any) =>
                                                produce(prev, (draft: any) => {
                                                    if (e.target.checked) {
                                                        draft.permissions = (
                                                            BigInt(
                                                                draft.permissions ||
                                                                    "0"
                                                            ) | permission.bit
                                                        ).toString();
                                                    } else {
                                                        draft.permissions = (
                                                            BigInt(
                                                                draft.permissions ||
                                                                    "0"
                                                            ) & ~permission.bit
                                                        ).toString();
                                                    }
                                                })
                                            );
                                        }}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                </List>
            </TabPanel>
            <TabPanel value={value} index={2}></TabPanel>
        </div>
    );
};

export const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ display: "flex", flexDirection: "column", pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};
