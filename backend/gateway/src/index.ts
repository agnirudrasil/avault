import Redis from "ioredis";
import parser from "socket.io-msgpack-parser";
import { connect } from "amqplib";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { ClientToServerEvents, ServerToClientEvents } from "./types/events";
import { sendMessage } from "./utils/sendMessage";

(async () => {
    const io = new Server<ClientToServerEvents, ServerToClientEvents>({
        parser,
    });

    const pubClient = new Redis();
    const subClient = pubClient.duplicate();

    const connection = await connect("amqp://guest:guest@localhost");
    const channel = await connection.createChannel();
    const queue = "gateway_api_talks";

    channel.assertQueue(queue, {
        durable: true,
    });

    io.adapter(createAdapter(pubClient, subClient));
    io.on("connection", socket => {
        socket.on("IDENTIFY", async identify => {
            await sendMessage(
                queue,
                channel,
                JSON.stringify({
                    event: "IDENTIFY",
                    token: identify.token,
                })
            );
        });
    });

    io.listen(8080, {
        path: "/",
        cookie: true,
    });
})();
