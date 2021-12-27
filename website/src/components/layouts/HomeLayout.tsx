import styled from "@emotion/styled";
import { ChannelBar } from "../ChannelBar";
import { ServersBar } from "../ServerBar";
import { Add } from "@mui/icons-material";
import {
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Typography,
} from "@mui/material";
import { DMChannelItem } from "../DMChannelItem";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { useChannelsStore } from "../../../stores/useChannelsStore";

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100vh;
    width: 100%;
`;

export const HomeLayout: React.FC = () => {
    const privateChannels = useChannelsStore(state => state.privateChannels);
    return (
        <Container>
            <ServersBar />
            <ChannelBar>
                <ListItemButton selected sx={{ borderRadius: "5px" }}>
                    <ListItemIcon>
                        <EmojiPeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Friends" />
                </ListItemButton>
                <List
                    component="nav"
                    subheader={
                        <div
                            style={{
                                display: "flex",
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "space-between",
                                height: "100%",
                            }}
                        >
                            <ListSubheader component="div">
                                <Typography variant={"h7" as any}>
                                    DIRECT MESSAGES
                                </Typography>
                            </ListSubheader>
                            <IconButton>
                                <Add />{" "}
                            </IconButton>
                        </div>
                    }
                >
                    {privateChannels.map(channel => (
                        <DMChannelItem key={channel.id} text={channel.name} />
                    ))}
                </List>
            </ChannelBar>
        </Container>
    );
};
