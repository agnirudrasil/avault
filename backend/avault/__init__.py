import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_login import LoginManager

__version__ = (1, 0, 0, 'dev')


db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins=["http://localhost:5500"])
cors = CORS()
login_manager = LoginManager()


def create_app():

    app = Flask(__name__)
    db_url = os.environ.get('DATABASE_URL')

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        SQLALCHEMY_DATABASE_URI=db_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, message_queue='redis://')
    login_manager.init_app(app)
    cors.init_app(app, origins=['http://localhost:3000',
                                'http://127.0.0.1:5500',
                                'http://localhost:5500'])

    from avault.auth.views import bp
    app.register_blueprint(bp)

    return app
