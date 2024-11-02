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
    Button,
    ToggleButton,
    ToggleButtonGroup,
    ListItemIcon,
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
import { Emoji as EmojiMartEmoji, store, emojiIndex } from "emoji-mart";
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
import { Invite } from "../../Invite";
import { useCreateReaction } from "../../../../hooks/requests/useCreateReaction";
import { Emoji } from "../../markdown/styles/Emoji";
import { getEmojiUrl } from "../../markdown/emoji/getEmojiUrl";
import { useDeleteReaction } from "../../../../hooks/requests/useDeleteReaction";
import { usePinMessage } from "../../../../hooks/requests/usePinMessage";
import { useUnpinMessage } from "../../../../hooks/requests/useUnpinMessage";
import { useQueryClient } from "react-query";
import { updateMessagePin } from "../../addMessage";

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
        const { mutateAsync: createReaction } = useCreateReaction();
        const { mutateAsync: deleteReaction } = useDeleteReaction();
        const { mutateAsync: pinMesssage } = usePinMessage(message.channel_id);
        const { mutateAsync: unpinMessage } = useUnpinMessage(
            message.channel_id
        );
        const member: GuildMembers | undefined = useGuildsStore(
            state => state.guilds[guild]?.members[getUser()]
        );
        const queryClient = useQueryClient();
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

        const regex = new RegExp(
            `${window.location.host}/invite/(\\w{8,21})`,
            "g"
        );

        const invites = Array.from(
            new Set(
                [...message.content.matchAll(regex)].map(([_, code]) => code)
            )
        );

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
                                action: async (handleClose: any) => {
                                    const emoji = emojiIndex.search(key);
                                    if (emoji)
                                        await createReaction({
                                            channel_id: message.channel_id,
                                            message_id: message.id,
                                            emoji: (emoji[0] as any).native,
                                        });
                                    handleClose();
                                },
                                visible: true,
                                icon: (
                                    <EmojiMartEmoji
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
                    label: message.pinned ? "Unpin Message" : "Pin Message",
                    action: async handleClose => {
                        if (!message.pinned) {
                            await pinMesssage({
                                messageId: message.id,
                            });
                        } else {
                            await unpinMessage({
                                messageId: message.id,
                            });
                        }
                        updateMessagePin(queryClient, {
                            channel_id: message.channel_id,
                            message_id: message.id,
                        });
                        handleClose();
                    },
                    visible:
                        checkPermissions(
                            permissions,
                            Permissions.MANAGE_MESSAGES
                        ) && message.type !== 2,
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
                    {message.type === 2 ? (
                        <ListItemIcon>
                            <PushPin />
                        </ListItemIcon>
                    ) : (
                        <ListItemAvatar
                            className="message-avatar"
                            sx={{
                                alignSelf: "flex-start",
                                mt: disableHeader ? 0.3 : 1,
                                visibility: disableHeader
                                    ? "hidden"
                                    : "visible",
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
                                    <DefaultProfilePic
                                        tag={message.author.tag}
                                    />
                                </Avatar>
                            )}
                        </ListItemAvatar>
                    )}
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
                            message.type === 2 ? (
                                <Typography variant="subtitle1">
                                    {message.author.username}{" "}
                                    {message.author.bot && <BotIndication />}{" "}
                                    Pinned a{" "}
                                    <Button variant="text" size="small">
                                        message
                                    </Button>{" "}
                                    to this channel . See all{" "}
                                    <Button variant="text" size="small">
                                        pinned messages
                                    </Button>
                                    . <br />
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
                            ) : (
                                <Stack spacing={1}>
                                    <Typography
                                        component="div"
                                        sx={{
                                            p: 0,
                                            color: error
                                                ? "error.dark"
                                                : confirmed
                                                ? "GrayText"
                                                : undefined,
                                            userSelect: "text",
                                            cursor: "text",
                                        }}
                                        variant="body1"
                                    >
                                        <Markdown content={message.content} />
                                    </Typography>
                                    {invites.length ? (
                                        <Stack spacing={1}>
                                            {invites.map(invite => (
                                                <Invite
                                                    author={message.author}
                                                    key={invite}
                                                    code={invite}
                                                />
                                            ))}
                                        </Stack>
                                    ) : null}
                                    {message.attachments ? (
                                        <Stack spacing={1}>
                                            {message.attachments &&
                                                message.attachments.map(
                                                    attachment => (
                                                        <Attachments
                                                            key={attachment.id}
                                                            attachment={
                                                                attachment
                                                            }
                                                        />
                                                    )
                                                )}
                                        </Stack>
                                    ) : null}
                                    {message.reactions.length ? (
                                        <ToggleButtonGroup
                                            value={message.reactions
                                                .filter(r => r.me)
                                                .map(r => r.emoji)}
                                            exclusive={false}
                                            onChange={async (_, emojis) => {
                                                const newEmojis = emojis.filter(
                                                    (e: string) =>
                                                        !message.reactions.some(
                                                            r =>
                                                                r.emoji === e &&
                                                                r.me
                                                        )
                                                );
                                                const removedEmojis =
                                                    message.reactions
                                                        .filter(
                                                            r =>
                                                                !emojis.includes(
                                                                    r.emoji
                                                                ) && r.me
                                                        )
                                                        .map(r => r.emoji);
                                                await Promise.all([
                                                    ...newEmojis.map(
                                                        (emoji: string) =>
                                                            createReaction({
                                                                channel_id:
                                                                    message.channel_id,
                                                                message_id:
                                                                    message.id,
                                                                emoji,
                                                            })
                                                    ),
                                                    ...removedEmojis.map(
                                                        emoji =>
                                                            deleteReaction({
                                                                channel_id:
                                                                    message.channel_id,
                                                                message_id:
                                                                    message.id,
                                                                emoji,
                                                            })
                                                    ),
                                                ]);
                                            }}
                                        >
                                            {message.reactions.map(reaction => {
                                                const url = getEmojiUrl(
                                                    reaction.emoji
                                                );

                                                return (
                                                    <ToggleButton
                                                        value={reaction.emoji}
                                                        key={reaction.emoji}
                                                        size="small"
                                                    >
                                                        <Emoji
                                                            style={{
                                                                marginRight:
                                                                    "0.5rem",
                                                            }}
                                                            src={url}
                                                        />
                                                        {reaction.count}
                                                    </ToggleButton>
                                                );
                                            })}
                                        </ToggleButtonGroup>
                                    ) : null}
                                </Stack>
                            )
                        }
                    />
                </ListItemButton>
            </div>
        );
    }
);
