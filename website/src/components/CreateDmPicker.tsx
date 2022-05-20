import { Add, CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Autocomplete,
    autocompleteClasses,
    Avatar,
    Box,
    Checkbox,
    Divider,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Popover,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import shallow from "zustand/shallow";
import { useCreateDMChannel } from "../../hooks/requests/useCreateDMChannel";
import { Friend, useFriendsStore } from "../../stores/useFriendsStore";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { LightTooltip } from "./LightTooltip";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const PoperComponent = (props: any) => {
    const { disablePortal, anchorEl, open, ...other } = props;
    return (
        <div
            {...other}
            sx={{
                [`&.${autocompleteClasses.popperDisablePortal}`]: {
                    position: "relative",
                },
            }}
        />
    );
};

export const CreateDMPicker = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <LightTooltip title="Create DM" placement="top">
                <IconButton onClick={handleOpen} size="small">
                    <Add />
                </IconButton>
            </LightTooltip>
            <Popover
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
            >
                <PickerPopover />
            </Popover>
        </div>
    );
};

const PickerPopover: React.FC = () => {
    const friends = useFriendsStore(
        state => Object.values(state.friends),
        shallow
    );
    const [value, setValue] = useState<Friend[]>([]);
    const { mutateAsync, isLoading } = useCreateDMChannel();
    return (
        <Stack spacing={2} sx={{ p: 2, width: 600 }}>
            <Box>
                <Typography variant="h6">Select Friends</Typography>
                <Typography variant="caption" color="GrayText">
                    You can add {9 - value.length} more friends
                </Typography>
            </Box>
            <Autocomplete
                value={value}
                open
                options={friends}
                getOptionLabel={option => option.user.username}
                disableCloseOnSelect
                multiple
                onChange={(_, newValue) => {
                    if (newValue.length <= 9) {
                        setValue(newValue);
                    }
                }}
                getOptionDisabled={option =>
                    value.length >= 9 &&
                    Boolean(value.find(v => v.user.id !== option.user.id))
                }
                PopperComponent={PoperComponent}
                placeholder="Type the username of a friend"
                renderOption={(props, option, { selected }) => (
                    <ListItem
                        {...props}
                        secondaryAction={
                            <ListItemSecondaryAction>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    checked={selected}
                                />
                            </ListItemSecondaryAction>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar
                                src={
                                    option.user.avatar
                                        ? `${process.env.NEXT_PUBLIC_API_URL}avatars/${option.user.id}/${option.user.avatar}`
                                        : undefined
                                }
                            >
                                <DefaultProfilePic tag={option.user.tag} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={option.user.username}
                            secondary={option.user.username + option.user.tag}
                        />
                    </ListItem>
                )}
                renderInput={params => {
                    const { InputProps, disabled, ...props } = params;
                    return (
                        <TextField
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: undefined,
                            }}
                            disabled={value.length >= 2}
                            autoFocus
                            placeholder={
                                value.length > 0
                                    ? "Find or start a conversation"
                                    : "Type the username of a friend"
                            }
                            {...props}
                        />
                    );
                }}
            />
            <Divider flexItem />
            <LoadingButton
                loading={isLoading}
                onClick={async () =>
                    await mutateAsync({ recipient_ids: value.map(v => v.id) })
                }
                variant="contained"
                disableElevation
            >
                Create Group DM
            </LoadingButton>
        </Stack>
    );
};
