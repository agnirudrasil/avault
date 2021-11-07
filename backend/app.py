from eventlet import monkey_patch
monkey_patch()
from dotenv import load_dotenv
load_dotenv()

from avault import create_app, socketio


app = create_app()

if __name__ == '__main__':
    socketio.run(app)
