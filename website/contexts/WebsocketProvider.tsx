import { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { asyncGetAccessToken } from "../src/access-token";
import { useGuildsStore } from "../stores/useGuildsStore";
import { useChannelsStore } from "../stores/useChannelsStore";
import { Channel } from "../types/channels";
import shallow from "zustand/shallow";
import { Roles, useRolesStore } from "../stores/useRolesStore";
import { Unread, useUserStore } from "../stores/useUserStore";
import { Messages, useMessagesStore } from "../stores/useMessagesStore";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { setUserId } from "../src/user-cache";
import { InfiniteData, useQueryClient } from "react-query";
import produce from "immer";
import { addMessage } from "../src/components/addMessage";

export const WebsocketContext = createContext<{ socket: Socket | null }>({
    socket: null as any,
});

export const WebsocketProvider: React.FC = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(true);
    const {
        setGuilds,
        addGuilds,
        removeGuilds,
        updateGuilds,
        updateMember,
        addMember,
        removeMember,
    } = useGuildsStore(
        state => ({
            setGuilds: state.setGuilds,
            addGuilds: state.addGuilds,
            removeGuilds: state.removeGuild,
            updateGuilds: state.updateGuild,
            updateMember: state.updateMember,
            addMember: state.addMember,
            removeMember: state.removeMember,
        }),
        shallow
    );
    const { setRoles, updateRole, addRole, deleteRole } = useRolesStore(
        state => ({
            setRoles: state.setRoles,
            updateRole: state.updateRole,
            addRole: state.addRole,
            deleteRole: state.deleteRole,
        }),
        shallow
    );
    const {
        updateMessage,
        deleteBulkMessages,
        deleteMessage,
        messageReactionAdd,
        messageReactionRemove,
        messageReactionRemoveAll,
        messageReactionRemoveEmoji,
    } = useMessagesStore(
        state => ({
            addMessage: state.addMessage,
            updateMessage: state.updateMessage,
            deleteMessage: state.deleteMessage,
            deleteBulkMessages: state.deleteBulkMessages,
            messageReactionRemoveAll: state.messageReactionRemoveAll,
            messageReactionRemove: state.messageReactionRemove,
            messageReactionAdd: state.messageReactionAdd,
            messageReactionRemoveEmoji: state.messageReactionRemoveEmoji,
        }),
        shallow
    );

    const { setUser, updateLastMessage, updateUnread } = useUserStore(
        state => ({
            setUser: state.setUser,
            isUserMe: state.isUserMe,
            updateGuildMember: state.updateGuildMembers,
            updateLastMessage: state.updateLastMessage,
            updateUnread: state.updateUnread,
        }),
        shallow
    );
    const { setChannels, updateChannel, deleteChannel, addChannel } =
        useChannelsStore(
            state => ({
                setChannels: state.setChannels,
                updateChannel: state.updateChannel,
                deleteGuildChannel: state.deleteChannel,
                addChannel: state.addChannel,
                deleteChannel: state.deleteChannel,
            }),
            shallow
        );

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_GATEWAY_URL || "", {
            transports: ["websocket"],
            path: "/",
        });
        setSocket(socket);
        return () => {
            socket?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("connect", async () => {
                try {
                    const token = await asyncGetAccessToken();
                    socket.emit("IDENTIFY", {
                        token,
                        capabilities: 125,
                    });
                } catch (e) {
                    console.error(e);
                }
            });
            socket.once("READY", (data: any) => {
                const guildChannels: Record<
                    string,
                    Record<string, Channel>
                > = {};
                const unread: Record<string, Unread> = {};
                const guildsRoles: Record<string, Roles[]> = {};
                for (const guild of data.guilds) {
                    guildChannels[guild.id] = (
                        guild.channels as Channel[]
                    ).reduce((acc: any, curr: any) => {
                        acc[curr.id] = curr;
                        unread[curr.id] = {
                            lastMessageId: curr.last_message_id,
                            lastMessageTimestamp: curr.last_message_timestamp,
                            lastRead: data.unread[curr.id] as string,
                        };
                        return acc;
                    }, {});
                    guildsRoles[guild.id] = guild.roles;
                }
                setChannels({
                    channels: guildChannels,
                    privateChannels: data.private_channels,
                });

                setUserId(data.user.id);
                setUser(data.user, data.merged_members, unread);
                setRoles(guildsRoles);
                setGuilds(data.guilds);
                setLoading(false);
            });
            socket.on("MESSAGE_ACK", data => {
                updateUnread(data.message_id, data.channel_id);
            });
            socket.on("CHANNEL_CREATE", data => {
                addChannel(data);
            });
            socket.on("CHANNEL_UPDATE", data => {
                updateChannel(data);
            });
            socket.on("CHANNEL_DELETE", data => {
                deleteChannel(data.id, data.guild_id);
            });
            socket.on("GUILD_UPDATE", data => {
                updateGuilds(data);
            });
            socket.on("GUILD_DELETE", data => {
                removeGuilds(data.id);
                router.replace("/channels/@me");
            });
            socket.on("GUILD_CREATE", data => {
                addGuilds(data);
            });
            socket.on("GUILD_ROLE_CREATE", data => {
                addRole(data.guild_id, data.role);
            });
            socket.on("GUILD_ROLE_POSITION_UPDATE", data => {
                addRole(data.guild_id, data.role);
            });
            socket.on("GUILD_ROLE_UPDATE", data => {
                updateRole(data.guild_id, data.role);
            });
            socket.on("GUILD_ROLE_DELETE", data => {
                deleteRole(data.guild_id, data.role.id);
            });
            socket.on("GUILD_MEMBER_UPDATE", data => {
                updateMember(data);
            });
            socket.on("GUILD_MEMBER_ADD", data => {
                addMember(data);
            });
            socket.on("GUILD_MEMBER_REMOVE", data => {
                removeMember(data);
            });
            socket.on("MESSAGE_CREATE", data => {
                addMessage(queryClient, data);
                updateLastMessage(data.channel_id, {
                    lastMessageId: data.id,
                    lastMessageTimestamp: data.timestamp,
                });
            });
            socket.on("MESSAGE_UPDATE", data => {
                updateMessage(data);
            });
            socket.on("MESSAGE_DELETE", data => {
                deleteMessage(data.channel_id, data.id);
            });
            socket.on("MESSAGE_DELETE_BULK", data => {
                deleteBulkMessages(data);
            });
            socket.on("MESSAGE_REACTION_ADD", data => {
                queryClient.invalidateQueries([
                    "reactions",
                    data.channel_id,
                    data.message_id,
                    data.emoji,
                ]);
                messageReactionAdd(data);
            });
            socket.on("MESSAGE_REACTION_REMOVE", data => {
                queryClient.invalidateQueries([
                    "reactions",
                    data.channel_id,
                    data.message_id,
                    data.emoji,
                ]);
                messageReactionRemove(data);
            });
            socket.on("MESSAGE_REACTION_REMOVE_ALL", data => {
                queryClient.invalidateQueries([
                    "reactions",
                    data.channel_id,
                    data.message_id,
                    data.emoji,
                ]);
                messageReactionRemoveAll(data);
            });
            socket.on("CHANNEL_PINS_UPDATE", data => {
                queryClient.invalidateQueries(["pinned", data.channel_id]);
            });
            socket.on("MESSAGE_REACTION_REMOVE_EMOJI", data => {
                queryClient.invalidateQueries([
                    "reactions",
                    data.channel_id,
                    data.message_id,
                    data.emoji,
                ]);
                messageReactionRemoveEmoji(data);
            });
            socket.on("disconnect", reason => {
                if (reason === "io server disconnect") {
                    router.replace("/login");
                }
                console.log("Disconnected");
            });
            socket.on("connect_error", data => {
                console.error("connect_error", data);
            });
        }
    }, [socket]);

    return (
        <WebsocketContext.Provider value={{ socket }}>
            {loading &&
            !router.asPath.startsWith("/login") &&
            !router.asPath.startsWith("/register") ? (
                <div
                    style={{
                        width: "100%",
                        height: "100vh",
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    <div>
                        <CircularProgress />
                    </div>
                </div>
            ) : (
                children
            )}
        </WebsocketContext.Provider>
    );
};
