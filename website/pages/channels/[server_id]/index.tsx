import { Container, List } from "@mui/material";
import { NextPage } from "next";
import { ChannelBar } from "../../../src/components/ChannelBar";
import { ChannelLayout } from "../../../src/components/ChannelLayout";
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
            <MembersBar></MembersBar>
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
