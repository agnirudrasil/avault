import { MarkChatRead } from "@mui/icons-material";
import { Stack, Typography, Button } from "@mui/material";
import { memo } from "react";
import { useAckMessage } from "../../../hooks/requests/useAckMessage";
import { useUserStore } from "../../../stores/useUserStore";
import { hasUnread } from "../../has-unread";

export const MarkAsRead: React.FC<{ channelId?: string }> = memo(
    ({ channelId }) => {
        const unread = useUserStore(state => state.unread[channelId ?? ""]);
        const { mutateAsync } = useAckMessage();

        return unread && hasUnread(unread.lastRead, unread.lastMessageId) ? (
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    width: "98%",
                    bgcolor: "primary.dark",
                    m: "auto",
                    p: "0px 12px",
                    borderBottomLeftRadius: 7,
                    borderBottomRightRadius: 7,
                }}
            >
                <Typography sx={{ userSelect: "none" }}>
                    You have unread messages
                </Typography>
                <Button
                    size="small"
                    disableRipple
                    disableElevation
                    endIcon={<MarkChatRead />}
                    onClick={() =>
                        mutateAsync({
                            channel: channelId || "",
                            message: unread.lastMessageId || "",
                        })
                    }
                >
                    Mark as read
                </Button>
            </Stack>
        ) : null;
    }
);
