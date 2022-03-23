import os
from faker import Faker

fake = Faker()

for i in range(50):
    os.system(f"""curl -X POST http://localhost:8000/api/v1/channels/6905274936811212803/messages -H 'accept: application/json' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDg3NDk0MjAsInN1YiI6IjY5MDM2MjIwNTQ1NTA2OTg1NjAifQ.asSsjRZDvhdD-cQEftK54XJhWEp-uehy1prwEDXE3-I' -H 'Content-Type: application/json' -d '{{
                  "content": "{fake.text()}",
		  "embeds": [],
		  "tts": false,
		  "message_reference": null
              }}'""")
