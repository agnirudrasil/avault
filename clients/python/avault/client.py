import socketio
import asyncio


class Client:
    def __init__(self, prefix: str = ">") -> None:
        self.socket = socketio.AsyncClient()
        self._connected = False
        self.token = None
        self.prefix = prefix

        @self.socket.event
        async def connect():
            print("Connected")
            self._connected = True
            await self.socket.emit("IDENTIFY", {"token": self.token})

        @self.socket.event
        async def connect_error(data):
            print("Error: ", data)

        @self.socket.event
        async def disconnect():
            print("Disconnected")
            self._connected = False

        @self.socket.on("MESSAGE_CREATE")
        async def message_create(data):
            print("Message: ", data["content"])

        @self.socket.on("READY")
        async def ready(data):
            print("READY")

    async def _run(self, token) -> None:
        self.token = token
        await self.socket.connect(
            "wss://gateway.avault.agnirudra.me")
        await self.socket.wait()

    def run(self, token) -> None:
        asyncio.run(self._run(token))
