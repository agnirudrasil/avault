import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
} from "@mui/material";
import { Roles } from "../../../../../stores/useRolesStore";
import { useGetRoleMembers } from "../../../../../hooks/requests/useGetRoleMembers";
import { Guild } from "../../../../../stores/useGuildsStore";
import { Add, Clear } from "@mui/icons-material";
import { useState } from "react";
import { useGetMembers } from "../../../../../hooks/requests/useGetGuildMembers";
import { GuildMembers } from "../../../../../stores/useUserStore";
import { useAddGuildMemberRole } from "../../../../../hooks/requests/useAddGuildMemberRole";
import { useDeleteGuildMemberRole } from "../../../../../hooks/requests/useDeleteGuildMemberRole";

const GuildMember: React.FC<{ member: GuildMembers }> = ({
    member,
    children,
}) => {
    return (
        <ListItem key={member.user.id}>
            <ListItemAvatar>
                <Avatar
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}avatars/${member.user.id}/${member.user.avatar}`}
                />
            </ListItemAvatar>
            <ListItemText primary={member.nick || member.user.username} />
            {children}
        </ListItem>
    );
};

const DialogMembers = ({
    guildId,
    roleId,
}: {
    guildId: string;
    roleId: string;
}) => {
    const { data } = useGetMembers(guildId);
    const { mutateAsync, isLoading } = useAddGuildMemberRole();
    return (
        <List>
            {data?.members.map(member => (
                <GuildMember key={member.user.id} member={member}>
                    <ListItemSecondaryAction>
                        <IconButton
                            onClick={async () => {
                                await mutateAsync({
                                    guildMember: member,
                                    roleId,
                                });
                            }}
                            disabled={isLoading}
                        >
                            <Add />
                        </IconButton>
                    </ListItemSecondaryAction>
                </GuildMember>
            ))}
        </List>
    );
};

export const RoleMembers = ({ guild, role }: { guild: Guild; role: Roles }) => {
    const { data } = useGetRoleMembers(guild.id, role.id);
    const { mutateAsync, isLoading } = useDeleteGuildMemberRole();
    const [open, setOpen] = useState(false);
    return (
        <Stack>
            <Button onClick={() => setOpen(true)} variant="contained">
                Add Member
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Member</DialogTitle>
                <DialogContent dividers>
                    <DialogMembers roleId={role.id} guildId={guild.id} />
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        onClick={() => setOpen(false)}
                        color="primary"
                    >
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
            <List>
                {data?.map(member => (
                    <GuildMember key={member.user.id} member={member}>
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={async () => {
                                    await mutateAsync({
                                        guildMember: member,
                                        roleId: role.id,
                                    });
                                }}
                                disabled={isLoading}
                            >
                                <Clear />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </GuildMember>
                ))}
            </List>
        </Stack>
    );
};
