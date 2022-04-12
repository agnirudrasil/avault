from typing import Optional, Union

import msgpack
import redis
from celery import Celery

from api.core import settings
from api.core.events import get_recipients, Events

app = Celery('tasks', broker=f'pyamqp://guest:guest@{settings.RABBITMQ_HOST}:5672//')


@app.task
def add(x, y):
    return x + y


UID = "emitter"

pool = redis.ConnectionPool(host=settings.REDIS_HOST, port=6379, db=0)
r = redis.Redis(connection_pool=pool)


def sync_websocket_emitter(db, channel_id: Optional[int], guild_id: Optional[Union[int, str]], event: Events, args,
                           user_id: int = None):
    my_recipients = get_recipients(event, guild_id, channel_id, user_id, db)
    sync_emit(r, my_recipients, [], event, args)


def sync_emit(my_redis, rooms, except_rooms, ev: str, *args):
    data = list(args)

    data.insert(0, ev)

    packet = {
        'type': 2,
        'data': data,
    }

    opts = {
        'rooms': list(rooms) if rooms else '',
        'flags': '',
        'except': list(except_rooms) if except_rooms else ""
    }

    msg = msgpack.packb([UID, packet, opts])
    channel = 'socket.io' + '#' + "/" + "#"
    print(channel)

    my_redis.publish(channel, msg)
    print("Emitting")
