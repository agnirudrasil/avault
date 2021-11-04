import styled from "@emotion/styled";
import {
    Avatar,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { ChannelBar } from "../ChannelBar";
import { ChannelLayout } from "../ChannelLayout";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { MembersBar } from "../MembersBar";
import { ServersBar } from "../ServerBar";

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100vh;
    width: 100%;
`;

export const ServerLayout: React.FC<{
    name: string;
    members: any[];
    channels: any[];
}> = ({ name, members, channels, children }) => {
    return (
        <Container>
            <ServersBar />
            <ChannelBar name={name}>
                <ChannelLayout channels={channels} />
            </ChannelBar>
            <div style={{ width: "100%" }}>{children}</div>
            <MembersBar>
                {members.map(member => (
                    <ListItemButton key={member.id}>
                        <ListItemAvatar>
                            <Avatar>
                                <DefaultProfilePic tag={member.user.tag} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={member.user.username} />
                    </ListItemButton>
                ))}
            </MembersBar>
        </Container>
    );
};
