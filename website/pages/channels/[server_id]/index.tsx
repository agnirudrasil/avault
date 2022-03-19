import {
    Container,
    List,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
} from "@mui/material";
import { NextPage } from "next";
import { ChannelBar } from "../../../src/components/ChannelBar";
import { ChannelLayout } from "../../../src/components/ChannelLayout";
import { DefaultProfilePic } from "../../../src/components/DefaultProfilePic";
import { MembersBar } from "../../../src/components/MembersBar";
import { ServersBar } from "../../../src/components/ServerBar";
import { useGuildsStore } from "../../../stores/useGuildsStore";

interface Props {
    serverId: string;
    channelId: string;
}

const ServerIndexPage: NextPage<Props> = ({ serverId }) => {
    const guild = useGuildsStore(state => state[serverId]);
    return (
        <Container>
            <ServersBar />
            <ChannelBar name={guild?.name}>
                <ChannelLayout />
            </ChannelBar>
            <div
                style={{
                    width: "100%",
                    padding: "1rem",
                    paddingTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    height: "100vh",
                }}
            >
                <List
                    style={{
                        overflowY: "auto",
                        maxHeight: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column-reverse",
                        width: "100%",
                    }}
                ></List>
            </div>
            <MembersBar>
                {guild?.members.map((member: any) => (
                    <ListItemButton key={member.id}>
                        <ListItemAvatar>
                            <Avatar>
                                <DefaultProfilePic tag={member.user.tag} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={member.nickname || member.user.username}
                        />
                    </ListItemButton>
                ))}
            </MembersBar>
        </Container>
    );
};

ServerIndexPage.getInitialProps = async ctx => {
    return {
        serverId: ctx.query.server_id as string,
        channelId: ctx.query.channel as string,
    };
};

export default ServerIndexPage;
