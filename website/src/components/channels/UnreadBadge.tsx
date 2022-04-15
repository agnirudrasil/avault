import { Box } from "@mui/material";
import { memo } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { hasUnread } from "../../has-unread";

export const UnreadBadge: React.FC<{ channel_id: string }> = memo(
    ({ channel_id }) => {
        const unread = useUserStore(state => state.unread[channel_id]);

        return (
            <Box
                sx={{
                    position: "absolute",
                    width: "4px",
                    height: hasUnread(unread.lastRead, unread.lastMessageId)
                        ? "8px"
                        : "0px",
                    bgcolor: "common.white",
                    top: "50%",
                    left: "-14px",
                    transform: "translateY(-50%)",
                    borderRadius: "0 10px 10px 0",
                    transition: "height 300ms ease",
                }}
            />
        );
    }
);
