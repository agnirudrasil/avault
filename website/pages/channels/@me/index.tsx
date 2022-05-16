import { AccessibilityNew, Check, Clear, Message } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
    AppBar,
    Avatar,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Stack,
    TextField,
    ToggleButton,
    Toolbar,
    Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";
import { DefaultProfilePic } from "../../../src/components/DefaultProfilePic";
import { MeLayout } from "../../../src/components/layouts/MeLayout";
import { StyledToggleButtonGroup } from "../../../src/components/StyledToggleButtonGroup";
import { useFriendsStore } from "../../../stores/useFriendsStore";
import { padEnd } from "lodash";
import { RemoveFriendConfirmation } from "../../../src/components/dialogs/RemoveFriendsConfirmation";
import { useCreateFriend } from "../../../hooks/requests/useCreateFriend";
import { useAcceptFriend } from "../../../hooks/requests/useAcceptFriend";
import { useRemoveFriend } from "../../../hooks/requests/useRemoveFriend";

const FriendsInput = () => {
    const { mutateAsync, isSuccess, isError, isLoading } = useCreateFriend();
    const [value, setValue] = useState("");

    const [_, username, hash, tag] =
        /(.*?)(#)(\d{0,4})/g.exec(value) || ([] as string[]);

    return (
        <Stack
            sx={{
                width: "100%",
                p: 2,
                position: "relative",
                borderBottom: "1px solid #ffffff1f",
            }}
            spacing={2}
        >
            <Typography variant="h6">ADD FRIEND</Typography>
            <Typography variant="body2" color="GrayText">
                You can add a friend with their AVAULT Tag. It is cAsE
                sEnSiTiVe!
            </Typography>
            <TextField
                value={value}
                onChange={e => {
                    const value = e.target.value
                        .split("#")
                        .map((v, i) =>
                            i === 1 ? parseInt(v.slice(0, 4)) || "" : v
                        )
                        .join("#");

                    setValue(value);
                }}
                error={isError}
                helperText={
                    isError
                        ? "Could not send a friend request. Please double check the username and tag."
                        : isSuccess
                        ? "Successfully sent friend request."
                        : ""
                }
                fullWidth
                placeholder="Enter a Username#0000"
                InputProps={{
                    spellCheck: false,
                    startAdornment: value && (
                        <InputAdornment position="start">
                            <Typography
                                color="GrayText"
                                sx={{
                                    position: "absolute",
                                    ml: 1,
                                    mt: "2px",
                                    zIndex: -1,
                                }}
                            >
                                {username || value}
                                {hash || "#"}
                                {tag ? padEnd(tag, 4, "0") : "0000"}
                            </Typography>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <LoadingButton
                                onClick={async () => {
                                    try {
                                        await mutateAsync({
                                            username,
                                            tag: "#" + tag,
                                        });
                                        setValue("");
                                    } catch (e) {}
                                }}
                                loading={isLoading}
                                disabled={
                                    !value ||
                                    !username ||
                                    !hash ||
                                    !tag ||
                                    !(tag?.length === 4)
                                }
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                Add Friend
                            </LoadingButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Stack>
    );
};

const FriendsView = () => {
    const [selected, setSelected] = useState<number>(1);
    const friends = useFriendsStore(state => state.friends);
    const { mutateAsync: accept, isLoading: isAccepting } = useAcceptFriend();
    const { mutateAsync, isLoading } = useRemoveFriend();

    const keys =
        selected === 1
            ? Object.keys(friends).filter(k => friends[k].type === 1)
            : Object.keys(friends).filter(
                  k => friends[k].type === 3 || friends[k].type === 4
              );

    return (
        <Stack sx={{ width: "100%" }}>
            <AppBar
                position="static"
                variant="outlined"
                sx={{ borderLeft: 0, borderRight: 0 }}
            >
                <Toolbar>
                    <ListItem
                        disableGutters
                        disablePadding
                        sx={{ width: "max-content" }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                            <AccessibilityNew />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography
                                    sx={{ userSelect: "none" }}
                                    variant="h6"
                                >
                                    Friends
                                </Typography>
                            }
                        />
                    </ListItem>
                    <Divider
                        orientation="vertical"
                        sx={{ m: 2, height: "70%" }}
                    />
                    <StyledToggleButtonGroup
                        size="small"
                        exclusive
                        sx={{
                            "& .MuiToggleButtonGroup-grouped": {
                                mr: 3,
                            },
                        }}
                        value={selected}
                        onChange={(_, v) => v && setSelected(v as number)}
                    >
                        <ToggleButton value={1}>All</ToggleButton>
                        <ToggleButton value={2}>Pending</ToggleButton>
                        <ToggleButton value={4}>Blocked</ToggleButton>
                        <ToggleButton value={3} color="success">
                            Add Friend
                        </ToggleButton>
                    </StyledToggleButtonGroup>
                </Toolbar>
            </AppBar>
            {selected === 3 ? (
                <FriendsInput />
            ) : (
                <List
                    disablePadding
                    component={Stack}
                    divider={<Divider flexItem />}
                    sx={{ m: 3 }}
                >
                    <ListSubheader disableGutters disableSticky>
                        {selected === 1 ? "ALL FRIENDS" : "PENDING"} -{" "}
                        {keys.length}
                    </ListSubheader>
                    {keys.map(key => {
                        const friend = friends[key];
                        return (
                            <ListItem disableGutters key={key}>
                                <ListItemButton
                                    disableRipple
                                    disableTouchRipple
                                    sx={{ borderRadius: "4px" }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={
                                                friend.user.avatar
                                                    ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${friend.user.id}/${friend.user.avatar}`
                                                    : undefined
                                            }
                                        >
                                            <DefaultProfilePic
                                                tag={friend.user.tag}
                                            />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={friend.user.username}
                                    />
                                    <ListItemSecondaryAction>
                                        {friend.type === 1 ? (
                                            <>
                                                <IconButton>
                                                    <Message />
                                                </IconButton>
                                                <RemoveFriendConfirmation
                                                    friend={friend}
                                                />
                                            </>
                                        ) : friend.type === 3 ? (
                                            <>
                                                <IconButton
                                                    disabled={
                                                        isAccepting || isLoading
                                                    }
                                                    onClick={async () =>
                                                        await accept(friend.id)
                                                    }
                                                >
                                                    <Check color="success" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={async () =>
                                                        await mutateAsync(
                                                            friend.id
                                                        )
                                                    }
                                                    disabled={
                                                        isAccepting || isLoading
                                                    }
                                                >
                                                    <Clear color="error" />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton
                                                    onClick={async () =>
                                                        await mutateAsync(
                                                            friend.id
                                                        )
                                                    }
                                                    disabled={
                                                        isAccepting || isLoading
                                                    }
                                                >
                                                    <Clear color="error" />
                                                </IconButton>
                                            </>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Stack>
    );
};

const MyChannelsPage: NextPage = () => {
    return (
        <MeLayout>
            <FriendsView />
        </MeLayout>
    );
};

export default MyChannelsPage;
