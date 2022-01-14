import { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { asyncGetAccessToken } from "../src/access-token";
import { useGuildsStore } from "../stores/useGuildsStore";
import { useChannelsStore } from "../stores/useChannelsStore";
import { Channel } from "../types/channels";
import shallow from "zustand/shallow";
import { Roles, useRolesStore } from "../stores/useRolesStore";
import { useUserStore } from "../stores/useUserStore";
import { useMessagesStore } from "../stores/useMessagesStore";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

export const WebsocketContext = createContext<{ socket: Socket | null }>({
    socket: null as any,
});

export const WebsocketProvider: React.FC = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { setGuilds, addGuilds, removeGuilds, updateGuilds } = useGuildsStore(
        state => ({
            setGuilds: state.setGuilds,
            addGuilds: state.addGuilds,
            removeGuilds: state.removeGuild,
            updateGuilds: state.updateGuild,
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
        addMessage,
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

    const { setUser, isUserMe, updateGuildMember } = useUserStore(
        state => ({
            setUser: state.setUser,
            isUserMe: state.isUserMe,
            updateGuildMember: state.updateGuildMembers,
        }),
        shallow
    );
    const { setChannels, updateChannel, deleteChannel, addChannel } =
        useChannelsStore(
            state => ({
                setChannels: state.setChannels,
                updateChannel: state.updateChannel,
                deleteGuildChannel: state.deleteGuildChannel,
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
                const guildChannels: Record<string, Channel[]> = {};
                const guildsRoles: Record<string, Roles[]> = {};
                for (const guild of data.guilds) {
                    guildChannels[guild.id] = guild.channels;
                    guildsRoles[guild.id] = guild.roles;
                }
                setChannels({
                    ...guildChannels,
                    privateChannels: data.private_channels,
                });
                setUser(data.user, data.merged_members);
                setRoles(guildsRoles);
                setGuilds(data.guilds);
                setLoading(false);
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
            });
            socket.on("GUILD_CREATE", data => {
                addGuilds(data);
            });
            socket.on("GUILD_ROLE_CREATE", data => {
                addRole(data.guild_id, data.role);
            });
            socket.on("GUILD_ROLE_UPDATE", data => {
                updateRole(data.guild_id, data.role);
            });
            socket.on("GUILD_ROLE_DELETE", data => {
                deleteRole(data.guild_id, data.role.id);
            });
            socket.on("GUILD_MEMBER_UPDATE", data => {
                if (isUserMe(data.user.id)) {
                    updateGuildMember(data);
                }
            });
            socket.on("MESSAGE_CREATE", data => {
                console.log(data);
                addMessage(data);
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
                messageReactionAdd(data);
            });
            socket.on("MESSAGE_REACTION_REMOVE", data => {
                messageReactionRemove(data);
            });
            socket.on("MESSAGE_REACTION_REMOVE_ALL", data => {
                messageReactionRemoveAll(data);
            });
            socket.on("MESSAGE_REACTION_REMOVE_EMOJI", data => {
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
