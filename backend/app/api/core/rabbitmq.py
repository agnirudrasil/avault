import json
from asyncio import AbstractEventLoop

import aio_pika
from api import models
from api.api.deps import get_db
from api.core import emitter
from api.core.security import verify_jwt
from api.models.user import User
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session


async def handle_message(message):
    msgobj = json.loads(message)
    if msgobj["event"] == "IDENTIFY":
        try:
            data = verify_jwt(msgobj.get("token", ""))
            socket_id = msgobj["id"]
            db: Session = next(get_db())
            user: User = db.query(models.User).filter_by(id=data.sub).first()
            if user:
                await emitter.in_room(socket_id).sockets_join(str(user.id))
                guilds = user.guilds
                guild_data = []
                merged_members = []
                for guild in guilds:
                    await emitter.in_room(socket_id).sockets_join(str(guild.guild.id))
                    guild_data.append(guild.guild.serialize())
                    merged_members.append(guild.serialize())
                await emitter.in_room(socket_id).emit(
                    "READY", {"guilds": guild_data, "user": user.json(),
                              "private_channels": [channel.serialize() for channel in user.channel_members],
                              'merged_members': merged_members}
                )
                return
            await emitter.to(msgobj["id"]).disconnect_sockets(True)
        except (jwt.JWTError, ValidationError):
            await emitter.to(msgobj["id"]).disconnect_sockets(True)
            return


async def consume(loop: AbstractEventLoop):
    connection = await aio_pika.connect_robust(
        host="rabbit", loop=loop
    )

    queue_name = "gateway_api_talks"

    async with connection:
        # Creating channel
        channel = await connection.channel()

        # Declaring queue
        queue = await channel.declare_queue(queue_name, durable=True)

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    await handle_message(message.body)

                    if queue.name in message.body.decode():
                        break
