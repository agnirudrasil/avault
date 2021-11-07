import { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useGuildsStore } from "../stores/useGuildsStore";
import { useMessagesStore } from "../stores/useMessagesStore";

export const WebsocketContext = createContext<{ socket: Socket | null }>({
    socket: null as any,
});

export const WebsocketProvider: React.FC = ({ children }) => {
    const setGuilds = useGuildsStore(state => state.setGuilds);
    const [socket, setSocket] = useState<Socket | null>(null);
    const addMessage = useMessagesStore(state => state.addMessage);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
            transports: ["websocket"],
        });
        setSocket(socket);
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("connect", () => {
                console.log("connected");
            });
            socket.on("connect-data", data => {
                setGuilds(data.guilds);
                socket.emit("join", "I have joined");
                console.log("connect-data", data);
            });
            socket.on("message", data => {
                addMessage(data.message);
            });
            socket.on("disconnect", () => {
                console.log("disconnected");
            });
            socket.on("connect_error", data => {
                console.error("connect_error", data);
            });
        }
    }, [socket]);

    return (
        <WebsocketContext.Provider value={{ socket }}>
            {children}
        </WebsocketContext.Provider>
    );
};
