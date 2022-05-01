import { Box } from "@mui/material";
import { memo } from "react";
import { Unread } from "../../../stores/useUserStore";
import { hasUnread } from "../../has-unread";

export const UnreadBadge: React.FC<{ unread: Unread }> = memo(({ unread }) => {
    return (
        <Box
            sx={{
                position: "absolute",
                width: "4px",
                height:
                    hasUnread(unread?.lastRead, unread?.lastMessageId) ||
                    unread?.mentionCount
                        ? "8px"
                        : "0px",
                bgcolor: "common.white",
                top: "50%",
                left: "-5.5px",
                transform: "translateY(-50%)",
                borderRadius: "0 10px 10px 0",
                transition: "height 300ms ease",
            }}
        />
    );
});
