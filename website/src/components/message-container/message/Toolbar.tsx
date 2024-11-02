import {
    AddReaction,
    Delete,
    Edit,
    MoreHoriz,
    Replay,
    Reply,
} from "@mui/icons-material";
import { Paper, Popover, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useRouter } from "next/router";
import { InfiniteData, useQueryClient } from "react-query";
import { useMessageCreate } from "../../../../hooks/requests/useMessageCreate";
import { Messages } from "../../../../stores/useMessagesStore";
import { useUserStore } from "../../../../stores/useUserStore";
import { getUser } from "../../../user-cache";
import { LightTooltip } from "../../LightTooltip";
import produce from "immer";
import { chunk } from "lodash";
import { useRef, useState } from "react";
import { EmojiPicker } from "../../EmojiPicker";
import { useCreateReaction } from "../../../../hooks/requests/useCreateReaction";

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
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const [toolbarValue, setToolbarValue] = useState<string | null>(null);
    const { mutateAsync } = useCreateReaction();
    return (
        <>
            <ToggleButtonGroup
                exclusive
                value={toolbarValue}
                onChange={(_, v) => setToolbarValue(v)}
                ref={pickerRef}
                size="small"
            >
                <ToggleButton value="react">
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
                <ToggleButton onClick={handleContextMenu} value="more">
                    <LightTooltip title="More" placement="top">
                        <MoreHoriz fontSize="small" />
                    </LightTooltip>
                </ToggleButton>
            </ToggleButtonGroup>
            <Popover
                onClose={() => {
                    setToolbarValue(null);
                }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                anchorEl={pickerRef.current}
                open={toolbarValue === "react"}
            >
                <EmojiPicker
                    set="twitter"
                    theme="dark"
                    onSelect={async emoji => {
                        await mutateAsync({
                            channel_id: message.channel_id,
                            message_id: message.id,
                            emoji: (emoji as any).native,
                        });
                    }}
                />
            </Popover>
        </>
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
