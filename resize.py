import discord
from discord import Client

client = Client()


@client.command()
async def resize(ctx):
    from io import BytesIO
    from PIL import Image, ImageSequence
    import requests
    icon_url = ctx.guild.icon
    resp = requests.get(icon_url)
    icon = BytesIO(resp.content)
    async with Image.open(icon) as im:
        frames = ImageSequence.Iterator(im)
        first = next(frames)
        reversed_frames = []
        for frame in frames:
            reversed_frames.insert(0, frame.copy())
        async with BytesIO() as by:
            first.save(by, save_all=True,
                       append_images=reversed_frames, loop=0)
            channel = ctx.channel
            by.seek(0)
            await channel.send(file=discord.File(by, filename='icon.gif'))
