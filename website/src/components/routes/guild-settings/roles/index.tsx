import {
    Typography,
    CardHeader,
    Grid,
    List,
    ListItemText,
    ListSubheader,
    ListItemButton,
    Tab,
    Tabs,
    ListItemSecondaryAction,
    IconButton,
    Button,
    FormControl,
    FormLabel,
    Snackbar,
    Stack,
    TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useGuildsStore } from "../../../../../stores/useGuildsStore";
import { GuildSettingsLayout } from "../../../layouts/routes/GuildSettings";
import { useRolesStore } from "../../../../../stores/useRolesStore";
import { useState } from "react";
import { useCreateRoles } from "../../../../../hooks/requests/useCreateRole";
import { Add } from "@mui/icons-material";
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from "react-beautiful-dnd";
import { useBasePermissions } from "../../../../../hooks/usePermissions";
import { useUpdateRolePosition } from "../../../../../hooks/requests/useUpdateRolePosition";
import { LoadingButton } from "@mui/lab";
import isEqual from "lodash.isequal";
import { Formik, Form } from "formik";
import { RolePermission } from "./permissions";
import { RoleMembers } from "./member";
import { useDeleteRole } from "../../../../../hooks/requests/useDeleteRole";
import { useEditRole } from "../../../../../hooks/requests/useEditRole";

export const GuildSettingsRoles = () => {
    const router = useRouter();
    const guild = useGuildsStore(
        state => state.guilds[router.query.guild as string]
    );
    const roles = useRolesStore(state => state[router.query.guild as string]);
    const [selected, setSelected] = useState(guild.id);
    const { guildMember, memberRoles } = useBasePermissions(guild.id);
    const selectedRole = roles.find(role => role.id === selected);
    const [tab, setTab] = useState(selected === guild.id ? 1 : 0);
    const { mutateAsync, isLoading } = useCreateRoles();
    const { mutate } = useUpdateRolePosition();
    const { mutateAsync: deleteRole } = useDeleteRole(guild.id, selected);
    const { mutateAsync: editRole } = useEditRole(guild.id, selected);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const destinationIndex = roles.length - result.destination.index - 1;

        if (
            destinationIndex > memberRoles[0].position &&
            !guildMember.is_owner
        ) {
            return;
        }

        mutate({
            guildId: guild.id,
            id: result.draggableId,
            position: destinationIndex,
        });
        return;
    };

    return (
        <GuildSettingsLayout>
            <CardHeader
                title={<Typography variant="h6">Roles</Typography>}
                subheader={
                    <Typography variant="body2" color="GrayText">
                        Use roles to group your server members and assign
                        permissions.
                    </Typography>
                }
            />
            <Grid container spacing={2} maxHeight="100%" overflow="auto">
                <Grid item xs={4}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="roles">
                            {provided => (
                                <List
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <ListSubheader>
                                        Roles - {roles.length}
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                disabled={isLoading}
                                                onClick={async () => {
                                                    await mutateAsync(guild.id);
                                                }}
                                            >
                                                <Add />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListSubheader>
                                    {roles.toReversed().map((role, index) => (
                                        <Draggable
                                            key={role.id}
                                            draggableId={role.id}
                                            index={index}
                                        >
                                            {provided => (
                                                <ListItemButton
                                                    {...provided.draggableProps}
                                                    ref={provided.innerRef}
                                                    {...provided.dragHandleProps}
                                                    selected={
                                                        selected === role.id
                                                    }
                                                    sx={{
                                                        backgroundColor: `#${role.color.toString(
                                                            16
                                                        )}`,
                                                    }}
                                                    onClick={() =>
                                                        setSelected(role.id)
                                                    }
                                                    key={role.id}
                                                >
                                                    <ListItemText
                                                        primary={role.name}
                                                    />
                                                </ListItemButton>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Grid>
                <Grid item xs={8} maxHeight="100%" overflow="auto">
                    <CardHeader
                        title={
                            <Typography variant="h6">
                                Edit Role - {selectedRole?.name}
                            </Typography>
                        }
                        subheader={
                            <Tabs
                                value={tab}
                                variant="fullWidth"
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={(_, newValue) => setTab(newValue)}
                                aria-label="disabled tabs example"
                            >
                                <Tab
                                    disabled={selectedRole?.id === guild.id}
                                    label="Display"
                                />
                                <Tab label="Permissions" />
                                <Tab
                                    disabled={selectedRole?.id === guild.id}
                                    label="Members"
                                />
                            </Tabs>
                        }
                    />
                    {selectedRole && (
                        <Formik
                            enableReinitialize
                            initialValues={{
                                name: selectedRole.name,
                                permissions: BigInt(selectedRole.permissions),
                            }}
                            onSubmit={async values => {
                                await editRole({
                                    name: values.name,
                                    permissions: values.permissions.toString(),
                                });
                            }}
                        >
                            {({
                                values,
                                initialValues,
                                isSubmitting,
                                setFieldValue,
                                resetForm,
                                submitForm,
                            }) => (
                                <Form>
                                    <Snackbar
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "center",
                                        }}
                                        open={!isEqual(values, initialValues)}
                                        message="Careful - you have unsaved changes!"
                                        action={
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    color="inherit"
                                                    onClick={() => resetForm()}
                                                >
                                                    Reset
                                                </Button>
                                                <LoadingButton
                                                    loading={isSubmitting}
                                                    type="submit"
                                                    color="success"
                                                    variant="contained"
                                                    disableElevation
                                                    onClick={submitForm}
                                                >
                                                    Save Changes
                                                </LoadingButton>
                                            </Stack>
                                        }
                                    />
                                    {tab === 0 ? (
                                        <FormControl fullWidth>
                                            <FormLabel>Role Name</FormLabel>
                                            <TextField
                                                value={values.name}
                                                disabled={guild.id === selected}
                                                onChange={e =>
                                                    setFieldValue(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {(selectedRole?.position <
                                                memberRoles[0]?.position ||
                                                guildMember.is_owner) && (
                                                <Button
                                                    onClick={async () => {
                                                        await deleteRole();
                                                        setSelected(guild.id);
                                                    }}
                                                    sx={{ mt: 2 }}
                                                    color="error"
                                                    variant="contained"
                                                >
                                                    Delete Role
                                                </Button>
                                            )}
                                        </FormControl>
                                    ) : tab === 1 ? (
                                        <RolePermission
                                            role={selectedRole}
                                            guildId={guild.id}
                                        />
                                    ) : (
                                        <RoleMembers
                                            guild={guild}
                                            role={selectedRole}
                                        />
                                    )}
                                </Form>
                            )}
                        </Formik>
                    )}
                </Grid>
            </Grid>
        </GuildSettingsLayout>
    );
};
