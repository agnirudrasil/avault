import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Stack,
    useTheme,
    Theme,
    Popper,
} from "@mui/material";
import { format, isToday, isYesterday } from "date-fns";
import { memo, useMemo } from "react";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { Messages } from "../../../../stores/useMessagesStore";
import { getUser } from "../../../user-cache";
import { DefaultProfilePic } from "../../DefaultProfilePic";
import { Markdown } from "../../markdown/Markdown";
import { Attachments } from "../Attachments";
import { GuildMembers } from "../../../../stores/useUserStore";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { ContextMenu } from "../../context-menus/ContextMenu";
import { ContextMenuShape } from "../../context-menus/types";
import { copyToClipboard } from "../../../copy";
import {
    AddReaction,
    Delete,
    Edit,
    Link,
    MarkChatUnread,
    PushPin,
    Reply,
} from "@mui/icons-material";
import { Emoji, store } from "emoji-mart";
import { usePermssions } from "../../../../hooks/usePermissions";
import { checkPermissions } from "../../../compute-permissions";
import { Permissions } from "../../../permissions";
import { SxProps } from "@mui/system";
import { BotIndication } from "../../BotIndication";
import {
    bindHover,
    bindPopper,
    usePopupState,
} from "material-ui-popup-state/hooks";
import { MessageToolbar } from "./Toolbar";
import { useDeleteMessage } from "../../../../hooks/requests/useMessageDelete";

export const Message: React.FC<{
    message: Messages;
    guild: string;
    disableHeader: boolean;
    newMessage: boolean;
    error: boolean;
    confirmed: boolean;
    args: any;
}> = memo(
    ({ message, guild, newMessage, disableHeader, confirmed, error, args }) => {
        const theme = useTheme();
        const popupState = usePopupState({
            variant: "popper",
            popupId: `message-${message.id}`,
        });
        const { mutateAsync: deleteMessage } = useDeleteMessage(
            message.channel_id
        );
        const member: GuildMembers | undefined = useGuildsStore(
            state => state.guilds[guild]?.members[getUser()]
        );
        const { permissions } = usePermssions(guild, message.channel_id);

        const isMention = useMemo(
            () =>
                message.mention_everyone ||
                message.mention?.includes(getUser()) ||
                message.mention_roles?.some(m => member?.roles?.includes(m)),
            [message, member]
        );

        const date = new Date(message.timestamp);

        const { handleContextMenu, ...props } = useContextMenu();

        const menuObject: ContextMenuShape[][] = [
            [
                {
                    label: "Add Reaction",
                    action: handleClose => {
                        handleClose();
                    },
                    visible: checkPermissions(
                        permissions,
                        Permissions.ADD_REACTIONS
                    ),
                    children: [
                        ...Object.keys(store.get("frequently") ?? {})
                            .slice(0, 10)
                            .map(key => ({
                                label: key,
                                action: (handleClose: any) => {
                                    handleClose();
                                },
                                visible: true,
                                icon: (
                                    <Emoji
                                        size={24}
                                        set="twitter"
                                        emoji={
                                            {
                                                id: key,
                                            } as any
                                        }
                                    />
                                ),
                            })),
                        {
                            label: "Other Reactions",
                            action: handleClose => {
                                handleClose();
                            },
                            visible: true,
                            icon: <AddReaction />,
                        },
                    ],
                },
                {
                    label: "Edit Message",
                    action: handleClose => {
                        handleClose();
                    },
                    visible: message.author.id === getUser(),
                    icon: <Edit />,
                },
                {
                    label: "Pin Message",
                    action: handleClose => {
                        handleClose();
                    },
                    visible: checkPermissions(
                        permissions,
                        Permissions.MANAGE_MESSAGES
                    ),
                    icon: <PushPin />,
                },
                {
                    label: "Reply",
                    action: handleClose => {
                        handleClose();
                    },
                    visible: true,
                    icon: <Reply />,
                },
                {
                    label: "Mark Unread",
                    action: handleClose => {
                        handleClose();
                    },
                    visible: true,
                    icon: <MarkChatUnread />,
                },
                {
                    label: "Copy Message Link",
                    action: handleClose => {
                        copyToClipboard(
                            `${window.location.origin}/channels/${guild}/${message.channel_id}/${message.id}`
                        );
                        handleClose();
                    },
                    visible: true,
                    icon: <Link />,
                },
                {
                    label: "Delete Message",
                    action: async handleClose => {
                        await deleteMessage({ messageId: message.id });
                        handleClose();
                    },
                    visible:
                        checkPermissions(
                            permissions,
                            Permissions.MANAGE_MESSAGES
                        ) || message.author.id === getUser(),
                    color: theme.palette.error.dark,
                    icon: <Delete className="make-white" color="error" />,
                },
            ],
            [
                {
                    label: "Copy ID",
                    action: handleClose => {
                        copyToClipboard(message.id);
                        handleClose();
                    },
                    visible: true,
                },
            ],
        ];

        const style: SxProps<Theme> = {
            cursor: "default",
            borderLeft: isMention ? `3px solid white` : undefined,
            mt: disableHeader ? 0 : 2,
            pt: 0,
            pb: 0,
            borderTopStyle: "solid",
            borderTopWidth: newMessage ? 1 : 0,
            borderTopColor: "error.dark",
            position: "relative",
            "&:hover .message-avatar": {
                visibility: "visible",
            },
        };

        if (newMessage) {
            (style as any)["::after"] = {
                content: "'NEW'",
                position: "absolute",
                top: "0",
                right: "0",
                bgcolor: "error.dark",
                transform: "translateY(-50%)",
                p: 0.2,
                fontSize: "12px",
                borderRadius: "3px",
            } as any;
        }

        return (
            <div>
                <Popper placement="top-end" {...bindPopper(popupState)}>
                    <MessageToolbar
                        args={args}
                        error={error}
                        handleContextMenu={handleContextMenu}
                        message={message}
                    />
                </Popper>
                <ListItemButton
                    onContextMenu={handleContextMenu}
                    disableRipple
                    selected={isMention}
                    sx={style}
                    key={message.id}
                    {...bindHover(popupState)}
                >
                    <ContextMenu {...props} menuObject={menuObject} />
                    <ListItemAvatar
                        className="message-avatar"
                        sx={{
                            alignSelf: "flex-start",
                            mt: disableHeader ? 0.3 : 1,
                            visibility: disableHeader ? "hidden" : "visible",
                        }}
                    >
                        {disableHeader ? (
                            <Typography color="graytext" variant="caption">
                                {format(date, "p")}
                            </Typography>
                        ) : (
                            <Avatar
                                sx={{ width: 40, height: 40 }}
                                src={
                                    message.author.avatar
                                        ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${message.author.id}/${message.author.avatar}`
                                        : undefined
                                }
                            >
                                <DefaultProfilePic tag={message.author.tag} />
                            </Avatar>
                        )}
                    </ListItemAvatar>
                    <ListItemText
                        sx={{
                            m: 0.5,
                        }}
                        primary={
                            !disableHeader && (
                                <Typography variant="subtitle1">
                                    {message.author.username}{" "}
                                    {message.author.bot && <BotIndication />}{" "}
                                    <Typography
                                        component="span"
                                        variant="caption"
                                        color="GrayText"
                                        sx={{ fontWeight: "normal" }}
                                    >
                                        {isToday(date)
                                            ? `Today at ${format(date, "p")}`
                                            : isYesterday(date)
                                            ? `Yesterday at ${format(
                                                  date,
                                                  "p"
                                              )}`
                                            : format(date, "p")}
                                    </Typography>{" "}
                                </Typography>
                            )
                        }
                        secondary={
                            <Stack>
                                <Typography
                                    sx={{
                                        p: 0,
                                        color: error
                                            ? "error.dark"
                                            : confirmed
                                            ? "GrayText"
                                            : undefined,
                                    }}
                                    variant="body1"
                                >
                                    <Markdown content={message.content} />
                                </Typography>
                                <Stack spacing={1}>
                                    {message.attachments &&
                                        message.attachments.map(attachment => (
                                            <Attachments
                                                key={attachment.id}
                                                attachment={attachment}
                                            />
                                        ))}
                                </Stack>
                            </Stack>
                        }
                    />
                </ListItemButton>
            </div>
        );
    }
);
