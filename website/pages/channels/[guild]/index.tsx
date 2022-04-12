import { NextPage } from "next";
import { HomeLayout } from "../../../src/components/layouts/HomeLayout";

interface Props {
    serverId: string;
    channelId: string;
}

const ServerIndexPage: NextPage<Props> = () => {
    return <HomeLayout />;
};

ServerIndexPage.getInitialProps = async ctx => {
    return {
        serverId: ctx.query.server_id as string,
        channelId: ctx.query.channel as string,
    };
};

export default ServerIndexPage;
