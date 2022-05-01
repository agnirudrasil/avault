from PIL import Image
from fastapi import UploadFile
from werkzeug.utils import secure_filename

from api.core.config import settings
from api.core.security import snowflake_id
from api.core.storage import storage


async def file_to_attachment(file: UploadFile, channel_id: int):
    attachment_id = next(snowflake_id)
    filename = secure_filename(file.filename)
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    attachment = {
        "id": attachment_id,
        "filename": filename,
        "content_type": file.content_type,
        "size": size,
        "url": f"{settings.CDN_URL}/attachments/{channel_id}/{attachment_id}/{filename}",
    }

    if file.content_type.startswith("image/"):
        with Image.open(file.file) as im:
            attachment["width"] = im.width
            attachment["height"] = im.height

    file.file.seek(0)

    storage.upload_file(file.file, "avault",
                        f"attachments/{channel_id}/{attachment['id']}/{attachment['filename']}", "public",
                        file.content_type)

    return attachment
