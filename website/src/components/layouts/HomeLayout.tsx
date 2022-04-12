import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import { ChannelBar } from "../channels";
import { MembarsBar } from "../members";
import { MessageContainer } from "../message-container";
import { ServerBar } from "../ServerBar";

export const HomeLayout: React.FC = () => {
    const router = useRouter();
    return (
        <Stack sx={{ height: "100vh" }} direction="row">
            <ServerBar />
            <ChannelBar key={router.query.guild as string | undefined} />
            <MessageContainer />
            <MembarsBar />
        </Stack>
    );
};
