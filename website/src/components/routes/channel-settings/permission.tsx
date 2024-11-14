import { LoadingButton } from "@mui/lab";
import {
    CardHeader,
    Typography,
    Grid,
    List,
    ListSubheader,
    ListItemSecondaryAction,
    IconButton,
    ListItemButton,
    ListItemText,
    Snackbar,
    Stack,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    AlertTitle,
    Switch,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { ChannelSettingsLayout } from "../../layouts/routes/ChannelSettings";
import { Add, Check, Clear, Lock } from "@mui/icons-material";
import isEqual from "lodash.isequal";
import { useRouter } from "next/router";
import { useChannelsStore } from "../../../../stores/useChannelsStore";
import { useState } from "react";
import { useRolesStore } from "../../../../stores/useRolesStore";
import { useGetMembers } from "../../../../hooks/requests/useGetGuildMembers";
import { useUpdateChannelPermissions } from "../../../../hooks/requests/useUpdateChannelPermissions";
import { permissions, Permissions } from "../../../permissions";
import {
    useBasePermissions,
    usePermssions,
} from "../../../../hooks/usePermissions";
import {
    checkPermissions,
    computeOverwrites,
} from "../../../compute-permissions";
import produce from "immer";

type Unpacked<T> = T extends (infer U)[] ? U : T;

const Overwrites: React.FC<{ existing: string[] }> = ({ existing }) => {
    const router = useRouter();
    const roles = useRolesStore(state => state[router.query.guild as string]);

    const { data } = useGetMembers(router.query.guild as string);
    const { mutateAsync } = useUpdateChannelPermissions(
        router.query.channel as string
    );

    return (
        <List>
            <ListSubheader>Roles</ListSubheader>
            {roles
                .filter(
                    value =>
                        value.id !== router.query.guild &&
                        !existing.includes(value.id)
                )
                .map(value => (
                    <ListItemButton
                        onClick={async () => {
                            await mutateAsync({
                                type: 0,
                                id: value.id,
                                allow: "0",
                                deny: "0",
                            });
                        }}
                        key={value.id}
                    >
                        <ListItemText primary={value.name} />
                    </ListItemButton>
                ))}
            <ListSubheader>Members</ListSubheader>
            {data?.members
                .filter(m => !existing.includes(m.user.id))
                .map(member => (
                    <ListItemButton
                        onClick={async () => {
                            await mutateAsync({
                                type: 1,
                                id: member.user.id,
                                allow: "0",
                                deny: "0",
                            });
                        }}
                        key={member.user.id}
                    >
                        <ListItemText primary={member.user.username} />
                    </ListItemButton>
                ))}
        </List>
    );
};

export const ChannelSettingsPermissions: React.FC = () => {
    const router = useRouter();
    const { data } = useGetMembers(router.query.guild as string);
    const roles = useRolesStore(state => state[router.query.guild as string]);
    const { guildMember, permissions: memberPermissions } = usePermssions(
        router.query.guild as string,
        router.query.channel as string
    );
    const { permissions: basePermissions } = useBasePermissions(
        router.query.guild as string
    );
    const channel = useChannelsStore(
        state =>
            state.channels[router.query.guild as string][
                router.query.channel as string
            ]
    );
    const { mutateAsync } = useUpdateChannelPermissions(
        router.query.channel as string
    );

    const [open, setOpen] = useState(false);

    const [selected, setSelected] = useState(router.query.guild as string);

    const isDisabled = (
        permission: Unpacked<typeof permissions>,
        mode: "allow" | "deny" | "na"
    ) => {
        if (guildMember.is_owner) return false;

        const newChannel = produce(channel, draft => {
            const overwriteIndex = draft.overwrites.findIndex(
                value => value.id === selected
            );
            if (overwriteIndex !== -1) {
                switch (mode) {
                    case "allow":
                        if (
                            checkPermissions(
                                memberPermissions,
                                permission.value
                            )
                        ) {
                            draft.overwrites[overwriteIndex].allow = (
                                BigInt(draft.overwrites[overwriteIndex].allow) |
                                BigInt(permission.value)
                            ).toString();
                        }
                        draft.overwrites[overwriteIndex].deny = (
                            BigInt(draft.overwrites[overwriteIndex].deny) &
                            ~BigInt(permission.value)
                        ).toString();
                        break;
                    case "deny":
                        draft.overwrites[overwriteIndex].allow = (
                            BigInt(draft.overwrites[overwriteIndex].allow) &
                            ~BigInt(permission.value)
                        ).toString();
                        draft.overwrites[overwriteIndex].deny = (
                            BigInt(draft.overwrites[overwriteIndex].deny) |
                            BigInt(permission.value)
                        ).toString();
                        break;
                    case "na":
                        draft.overwrites[overwriteIndex].allow = (
                            BigInt(draft.overwrites[overwriteIndex].allow) &
                            ~BigInt(permission.value)
                        ).toString();
                        draft.overwrites[overwriteIndex].deny = (
                            BigInt(draft.overwrites[overwriteIndex].deny) &
                            ~BigInt(permission.value)
                        ).toString();
                }
            }
        });

        const newPermissions = computeOverwrites(
            basePermissions,
            guildMember,
            newChannel
        );

        return !checkPermissions(newPermissions, permission.value);
    };

    return (
        <ChannelSettingsLayout>
            <CardHeader
                title={<Typography variant="h6">Permission</Typography>}
                subheader={
                    <Typography variant="body2" color="GrayText">
                        Use permissions to customize who can do what in this
                        channel.
                    </Typography>
                }
            />
            <Alert
                icon={<Lock />}
                action={
                    <Switch
                        checked={
                            (BigInt(
                                channel.overwrites.find(
                                    value => value.id === router.query.guild
                                )?.deny ?? 0
                            ) &
                                BigInt(Permissions.VIEW_CHANNEL)) ===
                            BigInt(Permissions.VIEW_CHANNEL)
                        }
                        onClick={async () => {
                            const existingAllow = BigInt(
                                channel.overwrites.find(
                                    value => value.id === router.query.guild
                                )?.allow ?? 0
                            );
                            const existingDeny = BigInt(
                                channel.overwrites.find(
                                    value => value.id === router.query.guild
                                )?.deny ?? 0
                            );
                            await mutateAsync({
                                type: 0,
                                id: router.query.guild as string,
                                allow: (
                                    existingAllow ^
                                    BigInt(Permissions.VIEW_CHANNEL)
                                ).toString(),
                                deny: (
                                    existingDeny ^
                                    BigInt(Permissions.VIEW_CHANNEL)
                                ).toString(),
                            });
                        }}
                    />
                }
                severity="info"
            >
                <AlertTitle>Private Channel</AlertTitle>
                By making this channel private, only select members and roles
                will be able to view this channel.
            </Alert>

            <Grid container spacing={2} maxHeight="100%" overflow="auto">
                <Grid item xs={4}>
                    <List>
                        <ListSubheader>
                            Roles/Member
                            <ListItemSecondaryAction>
                                <IconButton
                                    onClick={async () => {
                                        setOpen(true);
                                    }}
                                >
                                    <Add />
                                </IconButton>
                                <Dialog
                                    onClose={() => {
                                        setOpen(false);
                                    }}
                                    open={open}
                                >
                                    <DialogTitle>Add Roles/Members</DialogTitle>
                                    <DialogContent dividers>
                                        <Overwrites
                                            existing={channel.overwrites.map(
                                                value => value.id
                                            )}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            autoFocus
                                            onClick={() => {
                                                setOpen(false);
                                            }}
                                            color="primary"
                                        >
                                            Done
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </ListItemSecondaryAction>
                        </ListSubheader>
                        <ListItemButton
                            onClick={() =>
                                setSelected(router.query.guild as string)
                            }
                            selected={selected === router.query.guild}
                        >
                            <ListItemText primary="@everyone" />
                        </ListItemButton>
                        {channel.overwrites
                            .filter(value => value.id !== router.query.guild)
                            .map(value => (
                                <ListItemButton
                                    onClick={() => setSelected(value.id)}
                                    selected={selected === value.id}
                                    key={value.id}
                                >
                                    <ListItemText
                                        primary={
                                            roles.find(
                                                role => role.id === value.id
                                            )?.name ||
                                            data?.members.find(
                                                member =>
                                                    member.user.id === value.id
                                            )?.user.username
                                        }
                                    />
                                </ListItemButton>
                            ))}
                    </List>
                </Grid>
                <Grid item xs={8} maxHeight="100%" overflow="auto">
                    <Formik
                        enableReinitialize
                        initialValues={{
                            permissions: {
                                allow: BigInt(
                                    channel.overwrites.find(
                                        value => value.id === selected
                                    )?.allow ?? 0
                                ),
                                deny: BigInt(
                                    channel.overwrites.find(
                                        value => value.id === selected
                                    )?.deny ?? 0
                                ),
                            },
                        }}
                        onSubmit={async values => {
                            await mutateAsync({
                                type: roles.find(role => role.id === selected)
                                    ? 0
                                    : 1,
                                id: selected,
                                allow: values.permissions.allow.toString(),
                                deny: values.permissions.deny.toString(),
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
                                <Field name="permissions">
                                    {({ field }: any) => (
                                        <List>
                                            {permissions.map(
                                                (permission, index) => (
                                                    <ListItemButton key={index}>
                                                        <ListItemText
                                                            primary={
                                                                permission.title
                                                            }
                                                            secondary={
                                                                permission.permission
                                                            }
                                                        />
                                                        <ListItemSecondaryAction>
                                                            <ToggleButtonGroup
                                                                onChange={(
                                                                    _,
                                                                    value
                                                                ) => {
                                                                    switch (
                                                                        value
                                                                    ) {
                                                                        case "allow":
                                                                            setFieldValue(
                                                                                "permissions",
                                                                                {
                                                                                    ...field.value,
                                                                                    allow:
                                                                                        field
                                                                                            .value
                                                                                            .allow |
                                                                                        BigInt(
                                                                                            permission.value
                                                                                        ),
                                                                                    deny:
                                                                                        field
                                                                                            .value
                                                                                            .deny &
                                                                                        ~BigInt(
                                                                                            permission.value
                                                                                        ),
                                                                                },
                                                                                false
                                                                            );
                                                                            break;
                                                                        case "deny":
                                                                            setFieldValue(
                                                                                "permissions",
                                                                                {
                                                                                    ...field.value,
                                                                                    allow:
                                                                                        field
                                                                                            .value
                                                                                            .allow &
                                                                                        ~BigInt(
                                                                                            permission.value
                                                                                        ),
                                                                                    deny:
                                                                                        field
                                                                                            .value
                                                                                            .deny |
                                                                                        BigInt(
                                                                                            permission.value
                                                                                        ),
                                                                                },
                                                                                false
                                                                            );
                                                                            break;
                                                                        case "na":
                                                                            setFieldValue(
                                                                                "permissions",
                                                                                {
                                                                                    ...field.value,
                                                                                    allow:
                                                                                        field
                                                                                            .value
                                                                                            .allow &
                                                                                        ~BigInt(
                                                                                            permission.value
                                                                                        ),
                                                                                    deny:
                                                                                        field
                                                                                            .value
                                                                                            .deny &
                                                                                        ~BigInt(
                                                                                            permission.value
                                                                                        ),
                                                                                },
                                                                                false
                                                                            );
                                                                            break;
                                                                    }
                                                                }}
                                                                value={
                                                                    field.value
                                                                        .allow &
                                                                    BigInt(
                                                                        permission.value
                                                                    )
                                                                        ? "allow"
                                                                        : field
                                                                              .value
                                                                              .deny &
                                                                          BigInt(
                                                                              permission.value
                                                                          )
                                                                        ? "deny"
                                                                        : "na"
                                                                }
                                                                exclusive
                                                            >
                                                                <ToggleButton
                                                                    color="error"
                                                                    value="deny"
                                                                    disabled={isDisabled(
                                                                        permission,
                                                                        "deny"
                                                                    )}
                                                                >
                                                                    <Clear />
                                                                </ToggleButton>
                                                                <ToggleButton
                                                                    value="na"
                                                                    disabled={isDisabled(
                                                                        permission,
                                                                        "na"
                                                                    )}
                                                                >
                                                                    /
                                                                </ToggleButton>
                                                                <ToggleButton
                                                                    color="success"
                                                                    value="allow"
                                                                    disabled={isDisabled(
                                                                        permission,
                                                                        "allow"
                                                                    )}
                                                                >
                                                                    <Check />
                                                                </ToggleButton>
                                                            </ToggleButtonGroup>
                                                        </ListItemSecondaryAction>
                                                    </ListItemButton>
                                                )
                                            )}
                                        </List>
                                    )}
                                </Field>
                            </Form>
                        )}
                    </Formik>
                </Grid>
            </Grid>
        </ChannelSettingsLayout>
    );
};
