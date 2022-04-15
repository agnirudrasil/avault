from fastapi import UploadFile
from werkzeug.utils import secure_filename

from api.core.config import settings
from api.core.security import snowflake_id


def file_to_attachment(file: UploadFile, channel_id: int):
    attachment_id = next(snowflake_id)
    filename = secure_filename(file.filename)
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    return {
        "id": attachment_id,
        "filename": filename,
        "content_type": file.content_type,
        "size": size,
        "url": f"{settings.CDN_URL}/attachments/{channel_id}/{attachment_id}/{filename}",
    }
