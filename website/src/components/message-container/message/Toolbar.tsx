import {
    AddReaction,
    Delete,
    Edit,
    MoreHoriz,
    Replay,
    Reply,
} from "@mui/icons-material";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Messages } from "../../../../stores/useMessagesStore";
import { getUser } from "../../../user-cache";
import { LightTooltip } from "../../LightTooltip";

export const MessageToolbar: React.FC<{
    error: boolean;
    message: Messages;
    handleContextMenu: (event: React.MouseEvent) => void;
}> = ({ message, handleContextMenu, error }) => {
    return (
        <Paper
            sx={{
                m: 0,
                p: 0,
                mb: "-20%",
            }}
        >
            <ToggleButtonGroup size="small" color={error ? "error" : undefined}>
                {error ? (
                    <>
                        <ToggleButton value="resend">
                            <LightTooltip title="Resend" placement="top">
                                <Replay color="error" fontSize="small" />
                            </LightTooltip>
                        </ToggleButton>
                        <ToggleButton value="delete">
                            <LightTooltip
                                title="Delete Message"
                                placement="top"
                            >
                                <Delete color="error" fontSize="small" />
                            </LightTooltip>
                        </ToggleButton>
                    </>
                ) : (
                    <>
                        <ToggleButton value="edit">
                            <LightTooltip title="Add Reaction" placement="top">
                                <AddReaction fontSize="small" />
                            </LightTooltip>
                        </ToggleButton>
                        <ToggleButton
                            value={
                                message.author.id === getUser()
                                    ? "edit"
                                    : "reply"
                            }
                        >
                            <LightTooltip
                                title={
                                    message.author.id === getUser()
                                        ? "Edit"
                                        : "Reply"
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
                        <ToggleButton onClick={handleContextMenu} value="more">
                            <LightTooltip title="More" placement="top">
                                <MoreHoriz fontSize="small" />
                            </LightTooltip>
                        </ToggleButton>
                    </>
                )}
            </ToggleButtonGroup>
        </Paper>
    );
};
