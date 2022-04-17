import boto3

from .config import settings


class Storage:
    def __init__(self):
        self.s3_client = boto3.client('s3',
                                      endpoint_url="https://nyc3.digitaloceanspaces.com",
                                      region_name="nyc3",
                                      aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                      aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)

    def upload_file(self, file, bucket, path, access, content_type):
        self.s3_client.upload_fileobj(file, bucket, path,
                                      ExtraArgs={'ACL': "public-read" if access == "public" else "private",
                                                 "ContentType": content_type})


storage = Storage()
