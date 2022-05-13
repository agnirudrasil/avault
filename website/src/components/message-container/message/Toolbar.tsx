import { AddReaction, Edit, MoreHoriz, Reply } from "@mui/icons-material";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Messages } from "../../../../stores/useMessagesStore";
import { getUser } from "../../../user-cache";
import { LightTooltip } from "../../LightTooltip";

export const MessageToolbar: React.FC<{ message: Messages }> = ({
    message,
}) => {
    return (
        <Paper
            sx={{
                m: 0,
                p: 0,
                mb: "-20%",
            }}
        >
            <ToggleButtonGroup size="small">
                <ToggleButton value="edit">
                    <LightTooltip title="Add Reaction" placement="top">
                        <AddReaction fontSize="small" />
                    </LightTooltip>
                </ToggleButton>
                <ToggleButton
                    value={message.author.id === getUser() ? "edit" : "reply"}
                >
                    <LightTooltip
                        title={
                            message.author.id === getUser() ? "Edit" : "Reply"
                        }
                        placement="top"
                    >
                        {message.author.id === getUser() ? (
                            <Edit fontSize="small" />
                        ) : (
                            <Reply fontSize="small" />
                        )}
                    </LightTooltip>
                </ToggleButton>
                <ToggleButton value="more">
                    <LightTooltip title="More" placement="top">
                        <MoreHoriz fontSize="small" />
                    </LightTooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Paper>
    );
};
