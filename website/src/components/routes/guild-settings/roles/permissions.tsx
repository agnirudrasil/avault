import {
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Switch,
    TextField,
} from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useState } from "react";
import { permissions } from "../../../../permissions";
import { useBasePermissions } from "../../../../../hooks/usePermissions";
import { Roles } from "../../../../../stores/useRolesStore";
import {
    checkPermissions,
    computeBasePermissions,
} from "../../../../compute-permissions";
import produce from "immer";

type Unpacked<T> = T extends (infer U)[] ? U : T;

export const RolePermission = ({
    guildId,
    role,
}: {
    guildId: string;
    role: Roles;
}) => {
    const { setFieldValue } = useFormikContext();
    const [query, setQuery] = useState("");
    const {
        guildMember,
        memberRoles,
        permissions: memberPermissions,
        roles,
    } = useBasePermissions(guildId);
    const filteredPermissions = permissions.filter(permission =>
        query
            ? `${permission.title} ${permission.permission}`
                  .toLowerCase()
                  .includes(query.toLowerCase())
            : true
    );

    const isDisabled = (permission: Unpacked<typeof filteredPermissions>) => {
        if (guildMember.is_owner) return false;

        if (role.position >= memberRoles?.[0]?.position) return true;

        if (!checkPermissions(memberPermissions, permission.value)) return true;

        const newRoles = produce(roles, draft => {
            const roleIndex = draft.findIndex(r => r.id === role.id);
            if (roleIndex !== -1) {
                draft[roleIndex].permissions = (
                    BigInt(draft[roleIndex].permissions) ^
                    BigInt(permission.value)
                ).toString();
            }
        });

        const newPermissions = computeBasePermissions(
            newRoles,
            { id: guildId },
            guildMember
        );

        return !checkPermissions(newPermissions, permission.value);
    };

    return (
        <Stack>
            <TextField
                value={query}
                placeholder="Search Permissions"
                onChange={e => setQuery(e.target.value)}
            />

            <Field name="permissions">
                {({ field }: any) => (
                    <List>
                        {filteredPermissions.map(permission => {
                            const perm = BigInt(permission.value);
                            return (
                                <ListItem key={permission.permission}>
                                    <ListItemText
                                        primary={permission.title}
                                        secondary={permission.permission}
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={
                                                (field.value & perm) === perm
                                            }
                                            disabled={isDisabled(permission)}
                                            onChange={() => {
                                                setFieldValue(
                                                    "permissions",
                                                    field.value ^ perm
                                                );
                                            }}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Field>
        </Stack>
    );
};
