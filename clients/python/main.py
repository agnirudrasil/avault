import os

from avault import Client, Message, File

token = os.getenv("TOKEN", None)
assert token is not None, "Please set the TOKEN environment variable"

client = Client()


@client.command
async def ping(message: Message):
    if not message.author.bot:
        file = File("/home/agnirudras/averaged_frame.jpg")
        await message.channel.send("Pong!", attachments=[file])


client.run(token)
