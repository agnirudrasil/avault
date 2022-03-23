import styled from "@emotion/styled";
import { Clear, LooksOne, PushPin } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    Popover,
    SvgIcon,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import shallow from "zustand/shallow";
import { useBanMember } from "../../../hooks/requests/useBanMember";
import { useGetPinnedMessage } from "../../../hooks/requests/useGetPinnedMessages";
import { useKickMember } from "../../../hooks/requests/useKickMember";
import { useUnpinMessage } from "../../../hooks/requests/useUnpinMessage";
import { useContextMenu } from "../../../hooks/useContextMenu";
import { usePermssions } from "../../../hooks/usePermissions";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { Messages, useMessagesStore } from "../../../stores/useMessagesStore";
import { Roles, useRolesStore } from "../../../stores/useRolesStore";
import { checkPermissions } from "../../compute-permissions";
import { copyToClipboard } from "../../copy";
import { Permissions } from "../../permissions";
import { rolesSort } from "../../sort-roles";
import { getUser } from "../../user-cache";
import { ChannelBar } from "../ChannelBar";
import { PrivateChannelIcon, ChannelIcon } from "../ChannelIcon";
import { ChannelLayout } from "../ChannelLayout";
import { ContextMenu } from "../ContextMenu";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { EditServerProfileDialog } from "../dialogs/EditServerProfileDialog";
import { GuildMember } from "../GuildMember";
import { Markdown } from "../markdown/Markdown";
import { MembersBar } from "../MembersBar";
import { Message } from "../Message";
import { MessageBox } from "../MessageBox";
import { ServersBar } from "../ServerBar";

const Container = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100vh;
    width: 100%;
`;

export const organizeMessages = (
    messages: Messages[],
    setReference: (message: Messages) => void,
    onOpenPins: () => void,
    reference?: Messages
): React.ReactNode => {
    return !messages || !Array.isArray(messages)
        ? null
        : messages.map((m, index, array) => {
              const timestamp = new Date(m.timestamp);
              return (
                  <Message
                      onOpenPins={onOpenPins}
                      reference={reference}
                      setReference={setReference}
                      key={m.id}
                      type={
                          m.author.id === array[index + 1]?.author.id &&
                          timestamp.getTime() -
                              new Date(array[index + 1]?.timestamp).getTime() <=
                              5 * 60 * 1000
                              ? "full"
                              : "half"
                      }
                      message={{ ...m, timestamp }}
                  />
              );
          });
};

export const ServerLayout: React.FC = () => {
    const router = useRouter();
    const { data } = useGetPinnedMessage(router.query.channel as string);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const permissions = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );
    const [reference, setReference] = useState<Messages | null>(null);
    const ref = useRef<HTMLButtonElement | null>(null);
    const guild = useGuildsStore(
        state => state[router.query.server_id as string]
    );
    const channels = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const channel = channels.find(c => c.id === router.query.channel)!;

    const handleClick = () => {
        setAnchorEl(ref.current);
    };

    const handlePinsClose = () => {
        setAnchorEl(null);
    };

    const { mutate } = useUnpinMessage(router.query.channel as string);

    const isChannelPrivate = useMemo(() => {
        const overwrite = channel.overwrites.find(
            o => o.id === (router.query.server_id as string)
        );
        if (
            overwrite &&
            checkPermissions(BigInt(overwrite.deny), Permissions.VIEW_CHANNEL)
        ) {
            return true;
        }
    }, [channel]);

    const [loading, setLoading] = useState(false);

    const { messages, getChannelMessages } = useMessagesStore(
        state => ({
            messages: state[router.query.channel as string],
            getChannelMessages: state.getChannelMessages,
        }),
        shallow
    );

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const pinsOpen = Boolean(anchorEl);

    useEffect(() => {
        setLoading(true);
        getChannelMessages(router.query.channel as string)
            .then(() => {
                setLoading(false);
            })
            .catch(console.error);
    }, [router.query.channel]);

    return (
        <Container>
            <Popover
                open={pinsOpen}
                onClose={handlePinsClose}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Card>
                    <CardHeader title="Pinned Messages" />
                    <CardContent>
                        {data ? (
                            <List sx={{ minWidth: "400px" }} dense>
                                {data.map(m => (
                                    <ListItemButton
                                        key={m.id}
                                        sx={{
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                <DefaultProfilePic
                                                    tag={m.author.tag}
                                                />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography>
                                                    <GuildMember
                                                        id={m.author.id}
                                                    >
                                                        {m.author.username}
                                                    </GuildMember>
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography>
                                                    <Markdown
                                                        content={m.content}
                                                    />
                                                </Typography>
                                            }
                                        />
                                        {checkPermissions(
                                            permissions.permissions,
                                            Permissions.MANAGE_MESSAGES
                                        ) && (
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    onClick={() => {
                                                        mutate({
                                                            messageId: m.id,
                                                        });
                                                    }}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <Clear />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        )}
                                    </ListItemButton>
                                ))}
                            </List>
                        ) : (
                            <>
                                <Typography
                                    align="center"
                                    component="p"
                                    variant="h1"
                                >
                                    😭
                                </Typography>
                                <Typography align="center">
                                    This channel does not have any pinned
                                    messages...yet.
                                </Typography>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Popover>
            <ServersBar />
            <ChannelBar name={guild?.name}>
                <ChannelLayout />
            </ChannelBar>
            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>#{channel.name}</DialogTitle>
                <DialogContent>{channel.topic}</DialogContent>
            </Dialog>
            <div
                style={{
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    height: "100vh",
                }}
            >
                <Box
                    sx={{
                        height: "3.5rem",
                        borderBottom: "1px solid #ccc",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.15rem",
                        padding: "1.98rem",
                        justifyContent: "flex-start",
                    }}
                >
                    <SvgIcon>
                        {isChannelPrivate ? (
                            <PrivateChannelIcon />
                        ) : (
                            <ChannelIcon />
                        )}
                    </SvgIcon>
                    <Typography variant="h6">{channel.name}</Typography>
                    {channel.topic && (
                        <>
                            <Divider
                                orientation="vertical"
                                sx={{
                                    ml: "0.6rem",
                                    mr: "0.6rem",
                                    height: "1.5rem",
                                }}
                            />
                            <Typography
                                onClick={handleOpen}
                                sx={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    cursor: "pointer",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                    width: "100%",
                                }}
                            >
                                {channel.topic}
                            </Typography>
                        </>
                    )}
                    <IconButton
                        sx={{ ml: "auto" }}
                        ref={ref}
                        onClick={handleClick}
                    >
                        <PushPin />
                    </IconButton>
                </Box>
                <List
                    style={{
                        overflowY: "auto",
                        maxHeight: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column-reverse",
                        width: "100%",
                        maxWidth: "100%",
                        overflowX: "hidden",
                    }}
                >
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        organizeMessages(
                            messages,
                            setReference,
                            handleClick,
                            reference as any
                        )
                    )}
                </List>
                <Box sx={{ pl: "1rem", pr: "1rem", width: "100%", pb: "1rem" }}>
                    <MessageBox
                        setReference={setReference}
                        reference={reference}
                    />
                </Box>
            </div>
            <MembersBar>
                {Object.keys(guild?.members ?? {}).map((member_id: any) => {
                    const member = guild?.members[member_id];
                    return (
                        <MemberDisplay
                            key={member_id}
                            member={member}
                            member_id={member_id}
                        />
                    );
                })}
            </MembersBar>
        </Container>
    );
};

const MemberDisplay = ({ member_id, member }: any) => {
    const { contextMenu, handleClose, handleContextMenu } = useContextMenu();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { mutate: kick } = useKickMember();
    const { mutate: ban } = useBanMember();
    const roles = useRolesStore(
        state => state[router.query.server_id as string]
    );

    const permissions = usePermssions(
        router.query.server_id as string,
        router.query.channel as string
    );

    const otherMember = useMemo(() => {
        if (member) {
            const myRoles = member.roles?.map((r: any) =>
                roles.find(role => role.id === r)
            ) as Roles[];

            myRoles.sort(rolesSort);

            return myRoles;
        }
        return [];
    }, [roles, member]);

    return (
        <ListItemButton onContextMenu={handleContextMenu} key={member_id}>
            <EditServerProfileDialog
                onClose={() => setOpen(false)}
                open={open}
                id={member_id === getUser() ? undefined : member_id}
            />
            <ListItemAvatar>
                <Avatar>
                    <DefaultProfilePic tag={member.user.tag} />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <GuildMember id={member_id}>
                        {member.nick || member.user.username}
                    </GuildMember>
                }
            />
            <ContextMenu
                contextMenuItems={
                    [
                        {
                            title: "Change Nickname",
                            color: "info",
                            disabled:
                                member_id === getUser()
                                    ? !checkPermissions(
                                          permissions.permissions,
                                          Permissions.CHANGE_NICKNAME
                                      )
                                    : member.is_owner ||
                                      permissions.memberRoles[0]?.position <=
                                          otherMember[0]?.position ||
                                      !checkPermissions(
                                          permissions.permissions,
                                          Permissions.MANAGE_NICKNAMES
                                      ),
                            onClick: () => {
                                setOpen(true);
                            },
                        },
                        "divider",
                        {
                            title: "Ban",
                            color: "error",
                            disabled:
                                member.is_owner ||
                                member_id === getUser() ||
                                permissions.memberRoles[0]?.position <=
                                    otherMember[0]?.position ||
                                !checkPermissions(
                                    permissions.permissions,
                                    Permissions.BAN_MEMBERS
                                ),
                            onClick: () => {
                                ban({
                                    guildId: router.query.server_id as string,
                                    memberId: member_id,
                                });
                            },
                        },
                        {
                            title: "Kick",
                            color: "error",
                            disabled:
                                member.is_owner ||
                                member_id === getUser() ||
                                permissions.memberRoles[0]?.position <=
                                    otherMember[0]?.position ||
                                !checkPermissions(
                                    permissions.permissions,
                                    Permissions.KICK_MEMBERS
                                ),
                            onClick: () => {
                                kick({
                                    guildId: router.query.server_id as string,
                                    memberId: member_id,
                                });
                            },
                        },
                        "divider",
                        {
                            title: "Copy ID",
                            color: "info",
                            disabled: false,
                            onClick: () => {
                                copyToClipboard(member_id);
                            },
                            icon: <LooksOne />,
                        },
                    ] as any
                }
                contextMenu={contextMenu}
                handleClose={handleClose}
            />
        </ListItemButton>
    );
};
