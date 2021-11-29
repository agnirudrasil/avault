import { Channel } from "amqplib";

export const sendMessage = async (
    queue: string,
    channel: Channel,
    event: string
) => {
    channel.sendToQueue(queue, Buffer.from(event));
};
