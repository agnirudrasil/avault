import pytest
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


@pytest.fixture
def get_token():
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' \
           '.eyJzdWIiOiIxMzY3NjYyNjE4NjI0MCIsImlhdCI6MTY1MjI5NDk5NiwibWZhIjpmYWxzZX0' \
           '.4T4kSmvB9HKRCUdJ53hzaEdsm5e9o8jZe8pyLXsuMZU '


def test_get_me():
    response = client.get('/api/v1/users/@me')
    assert response.status_code == 401, "Should return 401"

    response = client.get('/api/v1/users/@me', headers={
        'Authorization': f'Bearer {get_token}'})

    assert response.status_code == 200, "Should return 200"
