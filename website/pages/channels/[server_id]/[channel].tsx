import { NextPage } from "next";
import { ChannelsIndexPage } from "../../../src/routes/ChannelIndex";
import { ChannelPermissions } from "../../../src/routes/ChannelPermissions";
import { ChannelSettings } from "../../../src/routes/ChannelSettings";
import SettingIndexPage from "../../../src/routes/SettingsIndex";
import { SettingsRoles } from "../../../src/routes/SettingsRoles";
import { useRoutesStore } from "../../../stores/useRoutesStore";

interface Props {
    serverId: string;
    channelId: string;
}

const ChannelsPage: NextPage<Props> = ({ serverId }) => {
    const route = useRoutesStore(state => state.route);

    switch (route) {
        case "/settings":
            return <SettingIndexPage />;
        case "/settings/roles":
            return <SettingsRoles />;
        case "/channel-settings":
            return <ChannelSettings />;
        case "/channel-settings/permissions":
            return <ChannelPermissions />;
        case "/":
        default:
            return <ChannelsIndexPage serverId={serverId} />;
    }
};

ChannelsPage.getInitialProps = async ctx => {
    return {
        serverId: ctx.query.server_id as string,
        channelId: ctx.query.channel as string,
    };
};

export default ChannelsPage;
