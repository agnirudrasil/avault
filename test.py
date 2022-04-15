import asyncio
import aiohttp
from aiohttp import FormData
from requests import session

url = "http://localhost:8000/api/v1/form"
data = FormData()
data.add_field('files', open(
    '/home/agnirudras/Pictures/profile.png', 'rb'), filename='profile.png')
data.add_field('files', open(
    '/home/agnirudras/Pictures/Signature.jpg', 'rb'), filename='Signature.jpg')


async def main():
    session = aiohttp.ClientSession()
    await session.post(url, data=data)
    await session.close()

asyncio.run(main())
