import json
from typing import Any, Optional

import aiohttp
from pydantic import BaseModel, PrivateAttr

from avault.file import File


class Channel(BaseModel):
    id: str
    name: str
    guild_id: str
    _state: Any = PrivateAttr()

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if "_state" in kwargs:
            self._state = kwargs["_state"]

    async def send(self, content, embeds=None, attachments: Optional[list[File]] = None):
        data = {"content": content, "embeds": embeds, "attachments": []}
        if attachments:
            print("Here")
            form_data = aiohttp.FormData(quote_fields=False)
            for i, file in enumerate(attachments):
                form_data.add_field("files", file.fp, filename=file.filename)
            del data["attachments"]
            form_data.add_field("payload_json", json.dumps(data), content_type="application/json",
                                filename="payload_json")
            data = form_data
        await self._state.session.post(f"/api/v1/channels/{self.id}/messages",
                                       data=data,
                                       headers={"Authorization": "Bearer " + self._state.token})
