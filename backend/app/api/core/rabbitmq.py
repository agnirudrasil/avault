from api.models.user import User
from itsdangerous import json


import json
import aio_pika
from asyncio import AbstractEventLoop
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from api import models
from api.core import emitter
from api.api.deps import get_db
from api.core.security import verify_jwt


async def handle_message(messsage):
    msgobj = json.loads(messsage)
    if msgobj['event'] == 'IDENTIFY':
        try:
            data = verify_jwt(msgobj['token'])
            id = msgobj['id']
            db: Session = get_db()
            user: User = db.query(models.User).filter_by(id=data.sub).first()
            if user:
                await emitter.in_room(id).sockets_join(str(user.id))
                guilds = user.guilds
                guild_data = []
                for guild in guilds:
                    await emitter.in_room(id).sockets_join(str(guild.id))
                    guild_data.append(guild.serialize())

                await emitter.in_room(id).emit('READY', {'guilds': guild_data,
                                                         'user': user.serialize()})
                return
            await emitter.to(msgobj['id']).disconnect_sockets(True)
        except (jwt.JWTError, ValidationError):
            await emitter.to(msgobj['id']).disconnect_sockets(True)
            return


async def consume(loop: AbstractEventLoop):

    connection = await aio_pika.connect_robust(
        "amqp://guest:guest@127.0.0.1/", loop=loop
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