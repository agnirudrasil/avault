import asyncio
import json
import aiohttp
from faker import Faker

f = Faker(["en_IN"])
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OTU0NjE4NTI3MjU5NDQzMiIsImlhdCI6MTY1MzI0MDQxOCwibWZhIjpmYWxzZX0.5HIulQhSBRBcrIzEr_9vcV2SbVgYtU75NbUcWXb6UIU"


async def main():
    async with aiohttp.ClientSession() as session:
        for i in range(1000):
            print(f"Sending message {i}")
            async with session.post("http://localhost:8000/api/v1/channels/51359900430372866/messages", headers={
                "content-type": "application/json",
                "authorization": f"Bearer {token}"
            }, data=json.dumps({
                "content": f.paragraph(nb_sentences=5)
            })) as resp:
                print(resp.status)
            await asyncio.sleep(.1)


asyncio.run(main())
