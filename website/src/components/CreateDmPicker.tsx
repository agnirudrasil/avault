import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    Autocomplete,
    autocompleteClasses,
    Avatar,
    Box,
    Checkbox,
    Divider,
    InputAdornment,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Popover,
    PopoverProps,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import shallow from "zustand/shallow";
import { useAddDmRecipient } from "../../hooks/requests/useAddDmRecipient";
import { useCreateDMChannel } from "../../hooks/requests/useCreateDMChannel";
import { useCreateInvite } from "../../hooks/requests/useCreateInvite";
import { Friend, useFriendsStore } from "../../stores/useFriendsStore";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { CopyButton } from "./Form/CopyButton";

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

export const CreateDMPicker: React.FC<
    Omit<PopoverProps, "open" | "anchorEl" | "handleClose"> & {
        children: (
            fn: (event: React.MouseEvent<HTMLButtonElement>) => void
        ) => React.ReactNode;
        filter?: string[];
        width?: number;
        context?: "add" | "create";
    }
> = ({ children, filter, width = 450, context = "create", ...props }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {children(handleOpen)}
            <Popover
                {...props}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
            >
                <PickerPopover
                    context={context}
                    handleClose={handleClose}
                    filter={filter}
                    width={width}
                />
            </Popover>
        </>
    );
};

const PickerPopover: React.FC<{
    handleClose: () => any;
    filter?: string[];
    width: number;
    context: "add" | "create";
}> = ({ handleClose, filter, width, context }) => {
    const router = useRouter();
    const friends = useFriendsStore(
        state =>
            Object.values(state.friends).filter(f =>
                filter ? !filter.includes(f.user.id) : true
            ),
        shallow
    );

    const [value, setValue] = useState<Friend[]>([]);
    const { mutateAsync: addRecipient, isLoading: isAdding } =
        useAddDmRecipient();
    const { mutateAsync, isLoading } = useCreateDMChannel();
    const {
        mutateAsync: createInvite,
        isLoading: isCreating,
        isSuccess,
        data,
    } = useCreateInvite();

    const length = value.length + (filter?.length ?? 0);

    return (
        <Stack spacing={2} sx={{ p: 2, width }}>
            <Box>
                <Typography variant="h6">Select Friends</Typography>
                <Typography variant="caption" color="GrayText">
                    You can add {9 - length} more friends
                </Typography>
            </Box>
            <Autocomplete
                value={value}
                open
                noOptionsText="No friends found"
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
                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${option.user.id}/${option.user.avatar}`
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
                    console.log(params);
                    const { InputProps, disabled, ...props } = params;
                    return (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {context === "add" &&
                                                value.length > 0 && (
                                                    <LoadingButton
                                                        onClick={async () => {
                                                            const requests =
                                                                value.map(v =>
                                                                    addRecipient(
                                                                        {
                                                                            userId: v
                                                                                .user
                                                                                .id,
                                                                            channelId:
                                                                                router
                                                                                    .query
                                                                                    .channel as string,
                                                                        }
                                                                    )
                                                                );
                                                            await Promise.all(
                                                                requests
                                                            );
                                                            handleClose();
                                                        }}
                                                        variant="contained"
                                                        disableElevation
                                                        loading={isAdding}
                                                    >
                                                        Add
                                                    </LoadingButton>
                                                )}
                                        </InputAdornment>
                                    ),
                                }}
                                disabled={length >= 2}
                                autoFocus
                                placeholder={
                                    length > 0
                                        ? "Find or start a conversation"
                                        : "Type the username of a friend"
                                }
                                {...props}
                            />
                        </Stack>
                    );
                }}
            />
            <Divider flexItem />
            {context === "add" ? (
                <TextField
                    placeholder={`${window.location.origin}/invite/example`}
                    value={
                        data?.id
                            ? `${window.location.origin}/invite/${data.id}`
                            : ""
                    }
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                {isSuccess && data ? (
                                    <CopyButton
                                        variant="contained"
                                        disableElevation
                                        text={`${window.location.origin}/invite/${data.id}`}
                                    />
                                ) : (
                                    <LoadingButton
                                        variant="contained"
                                        disableElevation
                                        loading={isCreating}
                                        onClick={async () => {
                                            await createInvite({
                                                channelId: router.query
                                                    .channel as string,
                                                body: {
                                                    max_age: 24 * 60 * 60,
                                                    max_uses: 0,
                                                },
                                            });
                                        }}
                                    >
                                        Create
                                    </LoadingButton>
                                )}
                            </InputAdornment>
                        ),
                    }}
                    helperText={
                        isSuccess && "Your invite link expires in 24 hours."
                    }
                />
            ) : (
                <LoadingButton
                    loading={isLoading}
                    onClick={async () => {
                        await mutateAsync({
                            recipient_ids: value.map(v => v.id),
                        });

                        handleClose();
                    }}
                    variant="contained"
                    disableElevation
                >
                    Create Group DM
                </LoadingButton>
            )}
        </Stack>
    );
};
