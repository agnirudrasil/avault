import { Clear, Group } from "@mui/icons-material";
import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    Link as MuiLink,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAckMessage } from "../../../../hooks/requests/useAckMessage";
import { useChannelUpdate } from "../../../../hooks/requests/useUpdateChannel";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { useUserStore } from "../../../../stores/useUserStore";
import { Channel } from "../../../../types/channels";
import { copyToClipboard } from "../../../copy";
import { getGroupDMName } from "../../../getGroupDmName";
import { hasUnread } from "../../../has-unread";
import { getUser } from "../../../user-cache";
import { ContextMenu } from "../../context-menus/ContextMenu";
import { ContextMenuShape } from "../../context-menus/types";
import { AvatarEditorDialog } from "../../dialogs/AvatarEditor";
import { ConfirmLeaveGroupDM } from "../../dialogs/ConfirmLeaveGroupDM";

export const GroupDMChannel: React.FC<{ channel: Channel }> = ({ channel }) => {
    const router = useRouter();
    const { handleContextMenu, ...rest } = useContextMenu();
    const unread = useUserStore(state => state.unread[channel.id]);
    const { mutateAsync: ackMessage } = useAckMessage();
    const { mutate: updateChannel } = useChannelUpdate();

    const menuObject: ContextMenuShape[][] = [
        [
            {
                label: "Mark As Read",
                visible: true,
                disabled: !hasUnread(unread?.lastRead, unread?.lastMessageId),
                action: async handleClose => {
                    await ackMessage({
                        channel: channel.id,
                        message: unread?.lastMessageId || "",
                    });
                    handleClose();
                },
            },
        ],
        [
            {
                label: "Invites",
                visible: channel.owner_id === getUser(),
                action: async handleClose => {
                    copyToClipboard(channel.id);
                    handleClose();
                },
            },
            {
                label: (
                    <AvatarEditorDialog
                        buttonText={<span>Change Avatar</span>}
                        height={200}
                        width={200}
                        onChange={v => {
                            updateChannel({
                                channelId: channel.id,
                                data: { icon: v },
                            });
                        }}
                    />
                ),
                visible: true,
                action: async () => {},
            },
            {
                label: "Remove Icon",
                visible: !!channel.icon,
                action: handleClose => {
                    updateChannel({
                        channelId: channel.id,
                        data: { icon: null },
                    });
                    handleClose();
                },
            },
        ],
        [
            {
                label: (
                    <ConfirmLeaveGroupDM channel={channel}>
                        {fn => (
                            <span onClick={() => fn(true)}>Leave Group</span>
                        )}
                    </ConfirmLeaveGroupDM>
                ),
                visible: true,
                action: async () => {},
                color: "error.dark",
            },
        ],
        [
            {
                label: "Copy ID",
                action: handleClose => {
                    copyToClipboard(channel.id);
                    handleClose();
                },
                visible: true,
            },
        ],
    ];

    return (
        <Link href={`/channels/@me/${channel.id}`}>
            <MuiLink sx={{ color: "white" }} underline="none">
                <ListItemButton
                    onContextMenu={handleContextMenu}
                    selected={router.query.channel === channel.id}
                    sx={{
                        borderRadius: "4px",
                        m: 1,
                        "&:hover .hidden": {
                            visibility: "visible",
                        },
                    }}
                >
                    <ContextMenu {...rest} menuObject={menuObject} />
                    <ListItemAvatar>
                        <Avatar
                            sx={{
                                bgcolor: channel.icon
                                    ? undefined
                                    : "success.dark",
                                color: "white",
                            }}
                            src={
                                channel.icon
                                    ? `${process.env.NEXT_PUBLIC_CDN_URL}channel-icons/${channel.id}/${channel.icon}`
                                    : undefined
                            }
                        >
                            <Group />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        sx={{
                            whiteSpace: "nowrap",
                            maxWidth: "100px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        primary={getGroupDMName(channel)}
                    />
                    <ConfirmLeaveGroupDM channel={channel}>
                        {fn => (
                            <ListItemSecondaryAction
                                sx={{ visibility: "hidden" }}
                                className="hidden"
                            >
                                <IconButton
                                    onClick={async () => {
                                        fn(true);
                                    }}
                                >
                                    <Clear />
                                </IconButton>
                            </ListItemSecondaryAction>
                        )}
                    </ConfirmLeaveGroupDM>
                </ListItemButton>
            </MuiLink>
        </Link>
    );
};
