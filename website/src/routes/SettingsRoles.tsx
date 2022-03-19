import { Add, Clear, Search } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
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
import { useCreateRoles } from "../../hooks/requests/useCreateRole";
import { useDeleteRole } from "../../hooks/requests/useDeleteRole";
import { useEditRole } from "../../hooks/requests/useEditRole";
import { useUpdateRolePosition } from "../../hooks/requests/useUpdateRolePosition";
import { useUnsaved } from "../../hooks/useUnsaved";
import { Roles, useRolesStore } from "../../stores/useRolesStore";
import { ColorPicker } from "../components/ColorPicker";
import { Android12Switch } from "../components/Form/AndroidSwitch";
import { SettingsLayout } from "../components/layouts/SettingsLayout";
import { RoleMembers } from "../components/RoleMembers";
import { permissions } from "../permissions";
import { rolesSort } from "../sort-roles";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export const SettingsRoles = () => {
    const router = useRouter();
    const { mutateAsync, isLoading: isCreating } = useCreateRoles();
    const { mutateAsync: update, isLoading } = useUpdateRolePosition();
    const ogData = useRolesStore(
        state => state[router.query.server_id as string]
    );
    const [selected, setSelected] = useState<string>(
        router.query.server_id as string
    );

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const endIndex = ogData.length - result.destination.index;

        await update({
            guildId: router.query.server_id as string,
            id: result.draggableId,
            position: endIndex,
        });
    };

    const createRole = async () => {
        await mutateAsync(router.query.server_id as string);
    };

    return (
        <SettingsLayout>
            <div
                style={{
                    minWidth: "740px",
                    width: "100%",
                    display: "flex",
                    height: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    maxHeight: "100vh",
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
                            maxHeight: "100vh",
                            overflowY: "auto",
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
                                    {Array.isArray(ogData) &&
                                        ogData
                                            ?.filter(
                                                (i: any) =>
                                                    i.id !==
                                                    router.query.server_id
                                            )
                                            .sort(rolesSort)
                                            .map((role: any) => (
                                                <Draggable
                                                    draggableId={role.id}
                                                    index={
                                                        ogData.length -
                                                        role.position
                                                    }
                                                    key={role.id}
                                                    isDragDisabled={isLoading}
                                                >
                                                    {provided => (
                                                        <ListItemButton
                                                            disableRipple
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                            disableTouchRipple
                                                            selected={
                                                                selected ===
                                                                role.id
                                                            }
                                                            onClick={() =>
                                                                setSelected(
                                                                    role.id
                                                                )
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
                                                                primary={
                                                                    role.name +
                                                                    `${role.position}`
                                                                }
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
                    role={ogData.find(r => r.id === selected)!}
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
    role: Roles;
    setSelected: (id: string) => any;
}> = ({ roleId, guildId, setSelected, role }) => {
    const updateRole = useRolesStore(state => state.updateRole);
    const [permsQuery, setPermsQuery] = useState<string>("");
    const { mutateAsync, isLoading: isUpdating } = useEditRole(guildId, roleId);
    const { mutateAsync: deleteRole, isLoading: deleteing } = useDeleteRole(
        guildId,
        roleId
    );
    const [value, setValue] = useState(guildId === roleId ? 1 : 0);
    const { ogData, setOgdata, handleReset, unsaved } = useUnsaved(role);

    const saveFn = async (data: any) => {
        await mutateAsync(data);
        updateRole(guildId, data);
    };

    const handleDelete = async () => {
        await deleteRole();
        setSelected(guildId);
    };

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <div
            style={{
                width: "100%",
                padding: "60px 0 0 30px",
                maxHeight: "100vh",
                overflow: "auto",
            }}
        >
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
            <Typography variant="h6">Edit Role - {ogData?.name}</Typography>
            <br />
            <Tabs value={value} onChange={handleChange}>
                <Tab disabled={guildId === roleId} label="Display" />
                <Tab label="Permissions" />
                <Tab disabled={guildId === roleId} label="Manage Members" />
            </Tabs>
            <TabPanel value={value} index={0}>
                <Typography variant="button">ROLE NAME*</Typography>
                <TextField
                    value={ogData?.name}
                    fullWidth
                    required
                    inputProps={{ readOnly: guildId === roleId }}
                    onChange={e => {
                        setOgdata(prev =>
                            produce(prev, draft => {
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
                    value={ogData?.color ?? 0}
                    onChange={color => {
                        setOgdata(prev =>
                            produce(prev, draft => {
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
                                    setOgdata(prev =>
                                        produce(prev, draft => {
                                            draft.mentionable =
                                                e.target.checked;
                                        })
                                    );
                                }}
                                checked={ogData?.mentionable}
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
                        ?.filter((permission: any) =>
                            permission.title.toLowerCase().match(permsQuery)
                        )
                        .map((permission: any) => (
                            <ListItem disableGutters sx={{ width: "100%" }}>
                                <ListItemText
                                    primary={permission.title}
                                    secondary={permission.description}
                                />
                                <ListItemSecondaryAction>
                                    <Android12Switch
                                        checked={Boolean(
                                            BigInt(ogData?.permissions || "0") &
                                                BigInt(permission.value)
                                        )}
                                        onChange={e => {
                                            setOgdata(prev =>
                                                produce(prev, draft => {
                                                    if (e.target.checked) {
                                                        draft.permissions = (
                                                            BigInt(
                                                                draft.permissions ||
                                                                    "0"
                                                            ) |
                                                            BigInt(
                                                                permission.value
                                                            )
                                                        ).toString();
                                                    } else {
                                                        draft.permissions = (
                                                            BigInt(
                                                                draft.permissions ||
                                                                    "0"
                                                            ) &
                                                            ~BigInt(
                                                                permission.value
                                                            )
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
            <TabPanel value={value} index={2}>
                <RoleMembers guildId={guildId} role={role} />
            </TabPanel>
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
