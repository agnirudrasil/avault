import Redis from "ioredis";
import { connect } from "amqplib";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { ClientToServerEvents, ServerToClientEvents } from "./types/events";
import { sendMessage } from "./utils/sendMessage";

(async () => {
    const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/";
    const RABBITMQ_URL =
        process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672/";
    const io = new Server<ClientToServerEvents, ServerToClientEvents>();

    const pubClient = new Redis(REDIS_URL);
    const subClient = pubClient.duplicate();

    const connection = await connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = "gateway_api_talks";

    await channel.assertQueue(queue, {
        durable: true,
    });

    console.log("Connected to RabbitMQ");

    io.adapter(createAdapter(pubClient, subClient));
    io.on("connection", socket => {
        socket.on("IDENTIFY", async identify => {
            await sendMessage(
                queue,
                channel,
                JSON.stringify({
                    event: "IDENTIFY",
                    token: identify.token,
                    id: socket.id,
                })
            );
        });
    });

    console.log("Websocket Server ready and listening on port 8080");

    io.listen(8080, {
        path: "/",
        cookie: true,
    });
})();
