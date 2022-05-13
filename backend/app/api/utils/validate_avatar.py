import base64
import hashlib
import io
import re

from PIL import Image
from fastapi import HTTPException
from starlette import status

from api.core.storage import storage


async def validate_avatar(user_id: str, avatar: str, img_type: str = "avatars"):
    image_data = base64.b64decode(re.sub('^data:image/.+;base64,', '', avatar))

    img = io.BytesIO(image_data)
    img.seek(0, 2)

    if img.tell() > 1024 * 1024 * 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Image too large")

    content_type = []

    with Image.open(img) as image:
        if image.format not in ['JPEG', 'PNG', "WEBP", "JPG"]:
            raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                                detail="Image must be one of JPEG, PNG or WEBP")
        content_type = [image.format, f"image/{image.format.lower()}"]

    img_hash = hashlib.sha224(image_data).hexdigest()

    img.seek(0)

    storage.upload_file(img, "avault",
                        f"{img_type}/{user_id}/{img_hash}", "public", content_type[1])

    return img_hash
