import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
} from "@mui/material";
import { ChannelBottom } from "./ChannelBottom";
import { ChannelTop } from "./ChannelTop";
import { ChannelTree } from "./ChannelTree";
import { Search } from "@mui/icons-material";
import { useState } from "react";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useRouter } from "next/router";
import { Channel } from "../../../types/channels";
import { ChannelIcon } from "../ChannelIcon";
import shallow from "zustand/shallow";

export const ChannelBar = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { channels, hiddenChannels, unhideChannel, hideChannel } =
        useChannelsStore(
            state => ({
                channels: state.channels[router.query.guild as string],
                hiddenChannels:
                    state.hiddenChannels[router.query.guild as string],
                hideChannel: state.hideChannel,
                unhideChannel: state.unhideChannel,
            }),
            shallow
        );

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const heirarchy = Object.values(channels ?? {}).reduce((acc, channel) => {
        if (channel.parent_id) {
            if (!acc[channel.parent_id]) {
                acc[channel.parent_id] = {
                    self: {} as Channel,
                    children: [],
                };
            }
            acc[channel.parent_id].children.push(channel);
        } else {
            if (acc[channel.id]) {
                acc[channel.id].self = channel;
            } else {
                acc[channel.id] = { self: channel, children: [] };
            }
        }
        return acc;
    }, {} as Record<string, { self: Channel; children: Channel[] }>);

    return (
        <List
            sx={{
                height: "100%",
                bgcolor: "grey.900",
                minWidth: "240px",
                width: "max-content",
                display: "flex",
                flexDirection: "column",
            }}
            disablePadding
        >
            <ChannelTop />
            <Box sx={{ width: "100%", p: 1 }}>
                <Button
                    variant="outlined"
                    sx={{ width: "100%" }}
                    startIcon={<Search />}
                    onClick={handleClickOpen}
                >
                    {" "}
                    Browse Channels
                </Button>
                <Dialog
                    onClose={handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={open}
                    scroll="paper"
                >
                    <DialogTitle id="customized-dialog-title">
                        Browse Channels
                    </DialogTitle>
                    <DialogContent dividers>
                        <List
                            sx={{
                                width: "520px",
                            }}
                        >
                            {Object.keys(heirarchy).map(value => (
                                <>
                                    <ListSubheader>
                                        {heirarchy[value].self.name}
                                    </ListSubheader>
                                    {heirarchy[value].children.map(channel => (
                                        <ListItem key={channel.id}>
                                            <ListItemIcon>
                                                <ChannelIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={channel.name}
                                            />
                                            <ListItemSecondaryAction>
                                                <Checkbox
                                                    edge="end"
                                                    onChange={() => {
                                                        if (
                                                            hiddenChannels?.includes(
                                                                channel.id
                                                            )
                                                        ) {
                                                            unhideChannel(
                                                                channel.id,
                                                                router.query
                                                                    .guild as string
                                                            );
                                                        } else {
                                                            hideChannel(
                                                                channel.id,
                                                                router.query
                                                                    .guild as string
                                                            );
                                                        }
                                                    }}
                                                    checked={
                                                        !hiddenChannels?.includes(
                                                            channel.id
                                                        )
                                                    }
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleClose} color="primary">
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <Divider />
            <ChannelTree />
            <Box sx={{ mb: "auto" }} />
            <ChannelBottom />
        </List>
    );
};
