import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import { ChannelBar } from "../channels";
import { MembarsBar } from "../members";
import { MessageContainer } from "../message-container";
import { ServerBar } from "../ServerBar";

export const HomeLayout: React.FC = () => {
    const router = useRouter();
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
            <ChannelBar
                key={
                    ((((router.query.guild as string) ?? "") +
                        router.query.channel) as string) ?? ""
                }
            />
            <MessageContainer />
            <MembarsBar />
        </Stack>
    );
};
