import { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { asyncGetAccessToken } from "../src/access-token";
import parser from "socket.io-msgpack-parser";
import { useGuildsStore } from "../stores/useGuildsStore";

export const WebsocketContext = createContext<{ socket: Socket | null }>({
    socket: null as any,
});

export const WebsocketProvider: React.FC = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const setGuilds = useGuildsStore(state => state.setGuilds);

    useEffect(() => {
        const socket = io("http://localhost:8080" || "", {
            transports: ["websocket"],
            path: "/",
            parser,
        });
        setSocket(socket);
        return () => {
            socket?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("connect", async () => {
                const token = await asyncGetAccessToken();
                console.log(token);
                socket.emit("IDENTIFY", {
                    token,
                    capabilities: 125,
                });
            });
            socket.once("READY", (data: any) => {
                console.log(data);
                setGuilds(data.guilds);
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
