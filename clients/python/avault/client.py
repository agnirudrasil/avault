import asyncio

import aiohttp
import socketio

from .models import Guild, Message, User


class Client:
    def __init__(self, prefix: str = ">") -> None:
        self.socket = socketio.AsyncClient()
        self._connected = False
        self.token = None
        self.prefix = prefix
        self.guilds: list[Guild] = []
        self.session: aiohttp.ClientSession = ...
        self.functions = None
        self.user = None

        @self.socket.event
        async def connect():
            print("Connected")
            self._connected = True
            await self.socket.emit("IDENTIFY", {"token": self.token})

        @self.socket.event
        async def disconnect():
            print(self.guilds)
            print("Disconnected")
            self._connected = False

        @self.socket.on("MESSAGE_CREATE")
        async def message_create(data):
            message = Message(**data, _state=self, channel={
                "id": data["channel_id"],
                "name": "general",
                "guild_id": data["guild_id"],
                "_state": self
            })
            await self.functions(message)

        @self.socket.on("READY")
        async def ready(data):
            print("READY")
            self.user = User(**data["user"], _state=self)
            for guild in data["guilds"]:
                self.guilds.append(Guild(_state=self, **guild))

    def command(self, func):
        self.functions = func

        async def run_command(*args, **kwargs):
            result = await self.functions(*args, **kwargs)
            return result

        return run_command

    async def _run(self, token) -> None:
        self.token = token
        self.session = aiohttp.ClientSession("https://avault.agnirudra.me")
        await self.socket.connect(
            "wss://gateway.avault.agnirudra.me/")
        await self.socket.wait()

    def run(self, token) -> None:
        asyncio.run(self._run(token))

    def __repr__(self):
        return f"<Client user={self.user.id}>"
