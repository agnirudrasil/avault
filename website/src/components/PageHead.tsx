import Head from "next/head";
import { useRouter } from "next/router";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { useUserStore } from "../../stores/useUserStore";
import { hasUnread } from "../has-unread";

export const PageHead = () => {
    const router = useRouter();
    const channel = useChannelsStore(
        state =>
            state.channels?.[router.query.guild as string]?.[
                router.query.channel as string
            ]?.name
    );
    const unread = useUserStore(state => state.unread);

    const hasUnreadChannels = Object.keys(unread).some(channel => {
        const u = unread[channel];
        return (
            (u?.mentionCount ?? 0) > 0 ||
            hasUnread(u?.lastRead, u?.lastMessageId)
        );
    });

    return (
        <Head>
            <title>{(channel ? `${channel} | ` : "") + "Avault"}</title>
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href={`/apple-touch-icon.png`}
            />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href={`${
                    hasUnreadChannels ? "/unread/" : ""
                }/favicon-32x32.png`}
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href={`${
                    hasUnreadChannels ? "/unread/" : ""
                }/favicon-16x16.png`}
            />
            <link rel="manifest" href={`/site.webmanifest`}></link>
        </Head>
    );
};
