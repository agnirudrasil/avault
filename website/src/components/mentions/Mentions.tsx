import { useRouter } from "next/router";
import { ChannelMention } from "./ChannelMention";
import { EveryoneMention } from "./EveryoneMention";
import { RoleMention } from "./RoleMention";
import { UserMention } from "./UserMention";

export const Mentions: React.FC<{
    id: string;
    type: "role" | "user" | "channel" | "everyone";
}> = ({ id, type }) => {
    const router = useRouter();

    switch (type) {
        case "role":
            return <RoleMention id={id} guild={router.query.guild as string} />;
        case "user":
            return <UserMention id={id} guild={router.query.guild as string} />;
        case "channel":
            return (
                <ChannelMention id={id} guild={router.query.guild as string} />
            );
        case "everyone":
        default:
            return <EveryoneMention />;
    }
};
