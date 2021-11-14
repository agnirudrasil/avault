import { LinearProgress } from "@mui/material";
import { useGetGuild } from "../../hooks/requests/useGetGuild";
import { ServerLayout } from "../components/layouts/ServerLayout";

export const ChannelsIndexPage: React.FC<{ serverId: string }> = ({
    serverId,
}) => {
    const { data, status } = useGetGuild(serverId);

    return status === "loading" || !data ? (
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
