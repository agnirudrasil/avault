import { Clear, Message } from "@mui/icons-material";
import {
    AppBar,
    Avatar,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Stack,
    Toolbar,
} from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";
import { DefaultProfilePic } from "../../../src/components/DefaultProfilePic";
import { MeLayout } from "../../../src/components/layouts/MeLayout";
import { useFriendsStore } from "../../../stores/useFriendsStore";

const FriendsView = () => {
    const [selected, setSelected] = useState<number>(0);
    const friends = useFriendsStore(state => state.friends);

    return (
        <Stack sx={{ width: "100%" }}>
            <AppBar
                position="static"
                variant="outlined"
                sx={{ borderLeft: 0, borderRight: 0 }}
            >
                <Toolbar>
                    <Button sx={{ mr: 3 }} color="inherit" size="small">
                        All
                    </Button>
                    <Button sx={{ mr: 3 }} color="inherit" size="small">
                        Pending
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        disableElevation
                        size="small"
                    >
                        Add Friend
                    </Button>
                </Toolbar>
            </AppBar>
            <List
                disablePadding
                component={Stack}
                divider={<Divider flexItem />}
                sx={{ m: 3 }}
            >
                <ListSubheader disableGutters disableSticky>
                    ALL FRIENDS - {Object.keys(friends).length}
                </ListSubheader>
                {Object.keys(friends)
                    .filter(key => friends[key].type)
                    .map(key => {
                        const friend = friends[key];
                        return (
                            <ListItem disableGutters key={key}>
                                <ListItemButton sx={{ borderRadius: "4px" }}>
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
                                        <IconButton>
                                            <Message />
                                        </IconButton>
                                        <IconButton color="error">
                                            <Clear color="error" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
            </List>
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
