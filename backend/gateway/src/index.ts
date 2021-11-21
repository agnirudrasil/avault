import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import parser from "socket.io-msgpack-parser";
import { ClientToServerEvents, ServerToClientEvents } from "./types/events";
import jwt from "jsonwebtoken";

const TOKEN = "qLuRm_BFVNJ1AZZWDUd8xCiso2wzTYJz82qCKDgiAlU";

const io = new Server<ClientToServerEvents, ServerToClientEvents>({ parser });

const pubClient = new Redis();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
io.on("connection", socket => {
    socket.on("IDENTIFY", identify => {
        try {
            const payload = jwt.verify(identify.token, TOKEN);
            socket.join(payload.sub as string);
        } catch (e) {
            socket.disconnect(true);
        }
    });
});

io.listen(8080, {
    path: "/",
    cookie: true,
});
