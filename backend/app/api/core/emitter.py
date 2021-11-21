import enum
import json
from typing import List, Any, Union
from aioredis import Redis

import msgpack


class RequestType(int, enum.Enum):
    SOCKETS = 0
    ALL_ROOMS = 1
    REMOTE_JOIN = 2
    REMOTE_LEAVE = 3
    REMOTE_DISCONNECT = 4
    REMOTE_FETCH = 5
    SERVER_SIDE_EMIT = 6


class PacketType(int, enum.Enum):
    CONNECT = 0
    DISCONNECT = 1
    EVENT = 2
    ACK = 3
    CONNECT_ERROR = 4
    BINARY_EVENT = 5
    BINARY_ACK = 6


class BroadcastOperatorError(Exception):
    def __init__(self, message: str):
        super().__init__(message)


UID = "emitter"


class Emitter:
    def __init__(self, redis_client: Redis, nsp: str = '/'):
        self.redis_client = redis_client
        self.broadcast_options = {
            'broadcast_channel': 'socket.io' + '#' + nsp + '#',
            'request_channel': 'socket.io' + '-request#' + nsp + '#',
            'nsp': nsp
        }

    def of(self, nsp: str):
        return Emitter(self.redis_client, ('' if nsp.startswith('/') else '/') + nsp)

    async def emit(self, ev: str, *args):
        return await BroadcastOperator(self.redis_client, self.broadcast_options).emit(ev, *args)

    def to(self, room: Union[str, List[str]]):
        return BroadcastOperator(self.redis_client, self.broadcast_options).to(room)

    def in_room(self, room: Union[str, List[str]]):
        return BroadcastOperator(self.redis_client, self.broadcast_options).in_room(room)

    def except_room(self, room: Union[str, List[str]]):
        return BroadcastOperator(self.redis_client, self.broadcast_options).except_room(room)

    def volatile(self):
        return BroadcastOperator(self.redis_client, self.broadcast_options).volatile()

    def compress(self, compress: bool):
        return BroadcastOperator(self.redis_client, self.broadcast_options).compress(compress)

    async def sockets_join(self, rooms: Union[List[str], str]):
        return await BroadcastOperator(self.redis_client, self.broadcast_options).sockets_join(rooms)

    async def sockets_leave(self, rooms: Union[List[str], str]):
        return await BroadcastOperator(self.redis_client, self.broadcast_options).sockets_leave(rooms)

    async def disconnect_sockets(self, close: bool):
        return await BroadcastOperator(self.redis_client, self.broadcast_options).disconnect_sockets(close)

    async def server_side_emit(self, *args):
        if callable(args[-1]):
            raise BroadcastOperatorError("Acknowledgements are not supported")

        request = json.dumps({
            'uid': UID,
            'type': RequestType.SERVER_SIDE_EMIT,
            'data': args
        })

        await self.redis_client.publish(self.broadcast_options['request_channel'], request)


RESERVED_EVENTS = {
    "connect",
    "connect_error",
    "disconnect",
    "disconnecting",
    "newListener",
    "removeListener",
}


class BroadcastOperator:
    def __init__(self, redis_client: Redis,
                 broadcast_options,
                 rooms=None,
                 except_rooms=None,
                 flags=None):
        if flags is None:
            flags = {}
        if except_rooms is None:
            except_rooms = set()
        if rooms is None:
            rooms = set()
        self.redis_client = redis_client
        self.broadcast_options = broadcast_options
        self.rooms = rooms
        self.except_rooms = except_rooms
        self.flags = flags

    def to(self, room: Union[List[str], str]):
        rooms = set(self.rooms)
        if isinstance(room, list):
            for r in room:
                rooms.add(r)
        else:
            rooms.add(room)

        return BroadcastOperator(self.redis_client,
                                 self.broadcast_options,
                                 rooms,
                                 self.except_rooms,
                                 self.flags)

    def in_room(self, room: List[str]):
        return self.to(room)

    def except_room(self, room: Union[str, List[str]]):
        except_rooms = set(self.except_rooms)
        if isinstance(room, list):
            for r in room:
                except_rooms.add(r)
        else:
            except_rooms.add(room)

        return BroadcastOperator(self.redis_client,
                                 self.broadcast_options,
                                 self.rooms,
                                 except_rooms,
                                 self.flags)

    def compress(self, compress: bool):
        flags = {**self.flags, 'compress': compress}
        return BroadcastOperator(self.redis_client, self.broadcast_options, self.rooms, self.except_rooms, flags)

    def volatile(self):
        flags = {**self.flags, 'volatile': True}
        return BroadcastOperator(self.redis_client, self.broadcast_options, self.rooms, self.except_rooms, flags)

    async def emit(self, ev: str, *args):
        if ev in RESERVED_EVENTS:
            raise BroadcastOperatorError(f'"{ev}" is a reserved event name')

        data = list(args)

        data.insert(0, ev)

        packet = {
            'type': PacketType.EVENT,
            'data': data,
            'nsp': self.broadcast_options['nsp']
        }

        opts = {
            'rooms': list(self.rooms) if self.rooms else '',
            'flags': self.flags if self.flags else '',
            'except': list(self.except_rooms) if self.except_rooms else ''
        }

        msg = msgpack.packb([UID, packet, opts])
        channel = self.broadcast_options['broadcast_channel']
        if self.rooms:
            channel += next(iter(self.rooms)) + "#"

        await self.redis_client.publish(channel, msg)

        return True

    async def sockets_join(self, rooms: Union[str, List[str]]):
        request = json.dumps({
            'type': RequestType.REMOTE_JOIN,
            'opts': {
                'rooms': list(self.rooms),
                'except': list(self.except_rooms)
            },
            'rooms': rooms if isinstance(rooms, list) else [rooms]
        })

        await self.redis_client.publish(self.broadcast_options['request_channel'], request)

    async def sockets_leave(self, rooms: Union[str, list[str]]):
        request = json.dumps({
            'type': RequestType.REMOTE_LEAVE,
            'opts': {
                'rooms': list(self.rooms),
                'except': list(self.except_rooms)
            },
            'rooms': rooms if isinstance(rooms, list) else [rooms]
        })

        await self.redis_client.publish(self.broadcast_options['request_channel'], request)

    async def disconnect_sockets(self, close: bool = False):
        request = json.dumps({
            'type': RequestType.REMOTE_DISCONNECT,
            'opts': {
                'rooms': list(self.rooms),
                'except': list(self.except_rooms)
            },
            'close': close
        })

        await self.redis_client.publish(self.broadcast_options['request_channel'], request)
