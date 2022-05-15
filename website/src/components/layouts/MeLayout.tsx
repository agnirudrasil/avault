import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import { CreateChannelDialogProvider } from "../../../contexts/CreateChannelContext";
import { CreateInviteDialogProvider } from "../../../contexts/CreateInviteContext";
import { useRoutesStore } from "../../../stores/useRoutesStore";
import { ChannelBar } from "../channels";
import { MeChannelBar } from "../MeChannelBar";
import { MembarsBar } from "../members";
import { MessageContainer } from "../message-container";
import { UserSettingsIndex } from "../routes/user-settings";
import { UserSettingsAuthorizedApps } from "../routes/user-settings/AuthorizedApp";
import { UserSettingsProfile } from "../routes/user-settings/Profile";
import { ServerBar } from "../ServerBar";

export const MeLayout: React.FC = ({ children }) => {
    const router = useRouter();
    const route = useRoutesStore(state => state.route);
    switch (route) {
        case "/user-settings":
            return <UserSettingsIndex />;
        case "/user-settings/profile":
            return <UserSettingsProfile />;
        case "/user-settings/authorized-apps":
            return <UserSettingsAuthorizedApps />;
        case "/":
        default:
            return (
                <Stack
                    sx={{
                        height: "100vh",
                        maxHeight: "100vh",
                        maxWidth: "100vw",
                        overflow: "hidden",
                    }}
                    direction="row"
                >
                    <ServerBar />
                    <MeChannelBar
                        key={
                            ((((router.query.guild as string) ?? "") +
                                router.query.channel) as string) ?? ""
                        }
                    />
                    {children}
                </Stack>
            );
    }
};
