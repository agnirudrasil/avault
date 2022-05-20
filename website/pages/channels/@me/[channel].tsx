import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { MeLayout } from "../../../src/components/layouts/MeLayout";
import { ChannelMembersBar } from "../../../src/components/members/ChannelMembersBar";
import { MessageContainer } from "../../../src/components/message-container";
import { useChannelsStore } from "../../../stores/useChannelsStore";

const MyPrivateChannelsPage: NextPage = () => {
    const router = useRouter();
    const channel = useMemo(
        () =>
            useChannelsStore.getState().privateChannels[
                router.query.channel as string
            ],
        [router]
    );
    return (
        <MeLayout>
            <MessageContainer />
            {channel.type === "GROUP_DM" && <ChannelMembersBar />}
        </MeLayout>
    );
};

export default MyPrivateChannelsPage;
