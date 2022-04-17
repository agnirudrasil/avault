import { NextPage } from "next";
import { HomeLayout } from "../../../src/components/layouts/HomeLayout";

interface Props {
    serverId: string;
    channelId: string;
}

const ChannelsPage: NextPage<Props> = () => {
    return <HomeLayout />;
};

ChannelsPage.getInitialProps = async ctx => {
    return {
        serverId: ctx.query.guild as string,
        channelId: ctx.query.channel as string,
    };
};

export default ChannelsPage;
