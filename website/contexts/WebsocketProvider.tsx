import { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { getAccessToken } from "../src/access-token";
import parser from "socket.io-msgpack-parser";

export const WebsocketContext = createContext<{ socket: Socket | null }>({
    socket: null as any,
});

export const WebsocketProvider: React.FC = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

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
            socket.on("connect", () => {
                socket.emit("IDENTIFY", {
                    token: getAccessToken(),
                    capabilities: 125,
                });
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
