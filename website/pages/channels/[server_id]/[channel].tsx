import { LinearProgress } from "@mui/material";
import { NextPage } from "next";
import { useGetGuild } from "../../../hooks/requests/useGetGuild";
import { ServerLayout } from "../../../src/layouts/ServerLayout";

interface Props {
    serverId: string;
    channelId: string;
}

const ChannelMessagePage: NextPage<Props> = ({ serverId }) => {
    const { data, status } = useGetGuild(serverId);
    return status === "loading" ? (
        <div>
            <LinearProgress />
        </div>
    ) : (
        <ServerLayout
            members={data.guild.members}
            channels={data.guild.channels}
            name={data.guild.name}
        ></ServerLayout>
    );
};

ChannelMessagePage.getInitialProps = async ctx => {
    return {
        serverId: ctx.query.server_id as string,
        channelId: ctx.query.channel as string,
    };
};

export default ChannelMessagePage;
