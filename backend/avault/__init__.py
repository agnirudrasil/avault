from datetime import timedelta
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from avault import snowflake

__version__ = (1, 0, 0, 'dev')

snowflake_id = snowflake.generator()
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
socketio = SocketIO(cors_allowed_origins=["http://localhost:5500"])
cors = CORS()
jwt = JWTManager()


def create_app():

    app = Flask(__name__)
    db_url = os.environ.get('DATABASE_URL')

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "dev"),
        SQLALCHEMY_DATABASE_URI=db_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
        JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30)
    )

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app, message_queue='redis://')
    cors.init_app(app, origins=['http://localhost:3000',
                                'http://127.0.0.1:5500',
                                'http://localhost:5500'])

    from avault.users.views import bp
    from avault.guild.views import bp as guild_bp
    from avault.channels.views import bp as channel_bp
    app.register_blueprint(bp)
    app.register_blueprint(guild_bp)
    app.register_blueprint(channel_bp)

    return app
