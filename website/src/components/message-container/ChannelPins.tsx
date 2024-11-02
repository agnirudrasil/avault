import { PushPin } from "@mui/icons-material";
import { IconButton, Popover, Skeleton, Stack } from "@mui/material";
import { useRef, useState } from "react";
import { Message } from "./message";
import { useGetPinnedMessage } from "../../../hooks/requests/useGetPinnedMessages";

export const ChannelPins: React.FC<{ channelId: string }> = ({ channelId }) => {
    const pinRef = useRef<HTMLButtonElement>(null);
    const [pinOpen, setPinOpen] = useState(false);
    const { data, isLoading } = useGetPinnedMessage(channelId);
    return (
        <>
            <IconButton
                onClick={() => {
                    setPinOpen(true);
                }}
                ref={pinRef}
            >
                <PushPin />
            </IconButton>
            <Popover
                open={pinOpen}
                anchorEl={pinRef.current}
                onClose={() => setPinOpen(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <Stack p={2} style={{ maxWidth: "450px", minWidth: "450px" }}>
                    {isLoading && (
                        <Skeleton height={100} variant="rectangular" />
                    )}
                    {data &&
                        data.map(m => (
                            <Message
                                key={m.id}
                                message={m}
                                guild={""}
                                disableHeader={false}
                                newMessage={false}
                                error={false}
                                confirmed={false}
                                args={undefined}
                            />
                        ))}
                </Stack>
            </Popover>
        </>
    );
};
