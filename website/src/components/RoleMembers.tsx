import { Clear, Group, Search } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Checkbox,
    Typography,
    ListItemSecondaryAction,
    ListItem,
} from "@mui/material";
import { useState } from "react";
import { useAddGuildMemberRole } from "../../hooks/requests/useAddGuildMemberRole";
import { useDeleteGuildMemberRole } from "../../hooks/requests/useDeleteGuildMemberRole";
import { useGetMembers } from "../../hooks/requests/useGetGuildMembers";
import { useGetRoleMembers } from "../../hooks/requests/useGetRoleMembers";
import { Roles } from "../../stores/useRolesStore";
import { GuildMembers } from "../../stores/useUserStore";
import { DefaultProfilePic } from "./DefaultProfilePic";

const AddMembersDialog: React.FC<{
    open: boolean;
    handleClose: () => any;
    role: Roles;
    guildId: string;
}> = ({ open, handleClose, guildId, role }) => {
    const { data, isLoading } = useGetMembers(guildId);
    const [search, setSearch] = useState("");
    const { mutateAsync: addRole } = useAddGuildMemberRole();
    const { mutateAsync: deleteRole } = useDeleteGuildMemberRole();

    const myData =
        search === ""
            ? data?.members
            : data?.members.filter(d => {
                  return ((d.nick || "") + d.user.username)
                      .toLowerCase()
                      .match(search.toLowerCase());
              });

    const handleAddRole = async (member: GuildMembers) => {
        await addRole({ guildMember: member, roleId: role.id });
    };

    const handleDeleteRole = async (member: GuildMembers) => {
        await deleteRole({ guildMember: member, roleId: role.id });
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Add Members</DialogTitle>
            <DialogContent>
                <TextField
                    label="Search Members"
                    placeholder="Search Members"
                    value={search}
                    fullWidth
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {search ? (
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearch("")}
                                    >
                                        <Clear />
                                    </IconButton>
                                ) : (
                                    <Search />
                                )}
                            </InputAdornment>
                        ),
                    }}
                />
                {isLoading ? (
                    <LinearProgress />
                ) : !myData || myData.length === 0 ? (
                    <Typography>No Members Found</Typography>
                ) : (
                    <List dense>
                        {myData.map(member => (
                            <ListItemButton>
                                <ListItemIcon>
                                    <Checkbox
                                        checked={Boolean(
                                            member.roles.find(
                                                r => r === role.id
                                            )
                                        )}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                handleAddRole(member);
                                            } else {
                                                handleDeleteRole(member);
                                            }
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemAvatar>
                                    <Avatar>
                                        <DefaultProfilePic
                                            tag={member.user.tag}
                                        />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography>
                                            {member.nick ||
                                                member.user.username}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography>
                                            {member.user.username}
                                            {member.user.tag}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const RoleMembers: React.FC<{ role: Roles; guildId: string }> = ({
    role,
    guildId,
}) => {
    const { data, isLoading } = useGetRoleMembers(guildId, role.id);
    const [open, setOpen] = useState(false);
    const { mutateAsync: deleteRole } = useDeleteGuildMemberRole();
    const [search, setSearch] = useState("");

    const myData =
        search === ""
            ? data
            : data?.filter(d => {
                  return ((d.nick || "") + d.user.username)
                      .toLowerCase()
                      .match(search.toLowerCase());
              });

    const handleDeleteRole = async (member: GuildMembers) => {
        await deleteRole({ guildMember: member, roleId: role.id });
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            {open && (
                <AddMembersDialog
                    guildId={guildId}
                    role={role}
                    open={open}
                    handleClose={handleClose}
                />
            )}
            {isLoading ? (
                <LinearProgress />
            ) : (
                <div>
                    <Box>
                        <TextField
                            label="Search Members"
                            size="small"
                            placeholder="Search Members"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {search ? (
                                            <IconButton
                                                size="small"
                                                onClick={() => setSearch("")}
                                            >
                                                <Clear />
                                            </IconButton>
                                        ) : (
                                            <Search />
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            disableElevation
                            style={{ marginLeft: "10px" }}
                            variant="contained"
                            onClick={handleOpen}
                        >
                            Add Members
                        </Button>
                    </Box>
                    {!myData || myData.length === 0 ? (
                        <Stack mt={5} alignItems="center" direction="row">
                            <Group fontSize="large" />
                            <Typography sx={{ userSelect: "none" }}>
                                No members were found
                            </Typography>
                            <Button onClick={handleOpen}>
                                Add members to this role
                            </Button>
                        </Stack>
                    ) : (
                        <List dense>
                            {myData.map(member => (
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <DefaultProfilePic
                                                tag={member.user.tag}
                                            />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography>
                                                {member.nick ||
                                                    member.user.username}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography>
                                                {member.user.username}
                                                {member.user.tag}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={async () => {
                                                await handleDeleteRole(member);
                                            }}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </div>
            )}
        </div>
    );
};
