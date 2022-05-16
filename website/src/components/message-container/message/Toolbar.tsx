import {
    AddReaction,
    Delete,
    Edit,
    MoreHoriz,
    Replay,
    Reply,
} from "@mui/icons-material";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useRouter } from "next/router";
import { InfiniteData, useQueryClient } from "react-query";
import { useMessageCreate } from "../../../../hooks/requests/useMessageCreate";
import { Messages } from "../../../../stores/useMessagesStore";
import { useUserStore } from "../../../../stores/useUserStore";
import { getUser } from "../../../user-cache";
import { LightTooltip } from "../../LightTooltip";
import produce from "immer";
import { chunk } from "lodash";

const ErrorToolbar: React.FC<{ args: any }> = ({ args }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const user = useUserStore(state => state.user);
    const { mutateAsync } = useMessageCreate(
        router.query.channel as string,
        user
    );

    return (
        <ToggleButtonGroup size="small" color="error">
            <ToggleButton
                value="resend"
                onClick={async () => await mutateAsync(args)}
            >
                <LightTooltip title="Resend" placement="top">
                    <Replay color="error" fontSize="small" />
                </LightTooltip>
            </ToggleButton>
            <ToggleButton
                onClick={() => {
                    queryClient.setQueryData<InfiniteData<Messages[]>>(
                        ["messages", router.query.channel as string],
                        produce(draft => {
                            if (draft) {
                                const messages = draft.pages.flat();
                                draft.pages = chunk(
                                    messages.filter(
                                        m => m.nonce !== args.nonce
                                    ),
                                    50
                                );
                            }
                        })
                    );
                }}
                value="delete"
            >
                <LightTooltip title="Delete Message" placement="top">
                    <Delete color="error" fontSize="small" />
                </LightTooltip>
            </ToggleButton>
        </ToggleButtonGroup>
    );
};

const RegularToolbar: React.FC<{
    message: Messages;
    handleContextMenu: (event: React.MouseEvent) => void;
}> = ({ message, handleContextMenu }) => {
    return (
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
                    title={message.author.id === getUser() ? "Edit" : "Reply"}
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
        </ToggleButtonGroup>
    );
};

export const MessageToolbar: React.FC<{
    error: boolean;
    message: Messages;
    handleContextMenu: (event: React.MouseEvent) => void;
    args: any;
}> = ({ message, handleContextMenu, error, args }) => {
    return (
        <Paper
            sx={{
                m: 0,
                p: 0,
                mb: "-20%",
            }}
        >
            {error ? (
                <ErrorToolbar args={args} />
            ) : (
                <RegularToolbar
                    message={message}
                    handleContextMenu={handleContextMenu}
                />
            )}
        </Paper>
    );
};
