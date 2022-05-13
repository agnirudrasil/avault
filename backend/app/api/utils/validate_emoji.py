import base64
import io
import re

from PIL import Image
from fastapi import HTTPException
from starlette import status

from api.core.storage import storage


async def validate_emoji(emoji_id: int, emoji: str) -> bool:
    image_data = base64.b64decode(re.sub('^data:image/.+;base64,', '', emoji))

    img = io.BytesIO(image_data)
    img.seek(0, 2)

    if img.tell() > 1024 * 256:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Image too large")

    with Image.open(img) as image:
        if image.format not in ['JPEG', 'PNG', "WEBP", "JPG", "GIF"]:
            raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                                detail="Image must be one of JPEG, PNG, GIF or WEBP")
        content_type = [image.format, f"image/{image.format.lower()}"]

    img.seek(0)

    storage.upload_file(img, "avault",
                        f"emojis/{emoji_id}", "public", content_type[1])

    return content_type[0] == "GIF"
