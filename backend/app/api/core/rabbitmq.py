import json
from asyncio import AbstractEventLoop
from datetime import datetime

import aio_pika
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from api import models
from api.api.deps import get_db
from api.core import emitter
from api.core.config import settings
from api.core.security import verify_jwt
from api.models import Relationship
from api.models.user import User


async def handle_message(message):
    msgobj = json.loads(message)
    if msgobj["event"] == "IDENTIFY":
        try:
            token = msgobj.get("token", "")
            data = verify_jwt(token)
            socket_id = msgobj["id"]
            db: Session = next(get_db())
            user: User = db.query(models.User).filter_by(id=data.sub).first()
            if user.last_login is None:
                await emitter.to(msgobj["id"]).disconnect_sockets(True)
                return
            if user.mfa_enabled != data.mfa:
                await emitter.to(msgobj["id"]).disconnect_sockets(True)
                return
            if user.last_login >= datetime.fromtimestamp(data.iat):
                await emitter.to(msgobj["id"]).disconnect_sockets(True)
                return
            if user:
                rooms = [str(user.id)]
                guilds = user.guilds
                guild_data = []
                merged_members = []
                unread: models.Unread = db.query(
                    models.Unread).filter_by(user_id=user.id).all()
                unread_dict = {}
                for unread in unread:
                    unread_dict[str(unread.channel_id)] = {"last_read": str(unread.last_message_id),
                                                           "mentions_count": unread.mentions_count}
                for guild in guilds:
                    rooms.append(str(guild.guild.id))
                    guild_data.append(guild.guild.serialize())
                    merged_members.append(guild.serialize())
                users: list[models.Relationship] = db.query(Relationship).filter(
                    ((Relationship.addressee_id == user.id) & (Relationship.type != 2)) | (
                            Relationship.requester_id == user.id)).all()
                await emitter.in_room(socket_id).sockets_join(rooms)
                await emitter.in_room(socket_id).emit(
                    "READY", {"guilds": guild_data, "user": user.json(),
                              "users": [relationship.serialize(user.id) for relationship in users],
                              "private_channels": [channel.channel.serialize(user.id) for channel in
                                                   filter(lambda c: not c.closed, user.channels)],
                              'merged_members': merged_members,
                              "unread": unread_dict}
                )
                return
            await emitter.to(msgobj["id"]).disconnect_sockets(True)
        except (jwt.JWTError, ValidationError):
            await emitter.to(msgobj["id"]).disconnect_sockets(True)
            return


async def consume(loop: AbstractEventLoop):
    connection = await aio_pika.connect_robust(
        host=settings.RABBITMQ_HOST, loop=loop
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
