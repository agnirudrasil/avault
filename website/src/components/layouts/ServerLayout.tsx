import styled from "@emotion/styled";
import { LooksOne } from "@mui/icons-material";
import {
    Avatar,
    CircularProgress,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import shallow from "zustand/shallow";
import { useBanMember } from "../../../hooks/requests/useBanMember";
import { useKickMember } from "../../../hooks/requests/useKickMember";
import { useContextMenu } from "../../../hooks/useContextMenu";
import { usePermssions } from "../../../hooks/usePermissions";
import { useGuildsStore } from "../../../stores/useGuildsStore";
import { useMessagesStore } from "../../../stores/useMessagesStore";
import { Roles, useRolesStore } from "../../../stores/useRolesStore";
import { checkPermissions } from "../../compute-permissions";
import { copyToClipboard } from "../../copy";
import { Permissions } from "../../permissions";
import { rolesSort } from "../../sort-roles";
import { getUser } from "../../user-cache";
import { ChannelBar } from "../ChannelBar";
import { ChannelLayout } from "../ChannelLayout";
import { ContextMenu } from "../ContextMenu";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { EditServerProfileDialog } from "../dialogs/EditServerProfileDialog";
import { GuildMember } from "../GuildMember";
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

export const organizeMessages = (messages: any[]): React.ReactNode => {
    return !messages || !Array.isArray(messages)
        ? null
        : messages.map((m, index, array) => {
              const timestamp = new Date(m.timestamp);
              return (
                  <Message
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
    const guild = useGuildsStore(
        state => state[router.query.server_id as string]
    );
    const [loading, setLoading] = useState(false);

    const { messages, getChannelMessages } = useMessagesStore(
        state => ({
            messages: state[router.query.channel as string],
            getChannelMessages: state.getChannelMessages,
        }),
        shallow
    );

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
            <ServersBar />
            <ChannelBar name={guild?.name}>
                <ChannelLayout />
            </ChannelBar>
            <div
                style={{
                    width: "100%",
                    padding: "1rem",
                    paddingTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    height: "100vh",
                }}
            >
                <List
                    style={{
                        overflowY: "auto",
                        maxHeight: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column-reverse",
                        width: "100%",
                    }}
                >
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        organizeMessages(messages as any[])
                    )}
                </List>
                <MessageBox />
            </div>
            <MembersBar>
                {Object.keys(guild?.members ?? {}).map((member_id: any) => {
                    const member = guild?.members[member_id];
                    return (
                        <MemberDisplay member={member} member_id={member_id} />
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
            const myRoles = member.roles?.map(r =>
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
                                    : permissions.memberRoles[0]?.position <
                                          otherMember[0].position ||
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
                                member_id === getUser() ||
                                permissions.memberRoles[0]?.position <
                                    otherMember[0].position ||
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
                                member_id === getUser() ||
                                permissions.memberRoles[0]?.position <
                                    otherMember[0].position ||
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
