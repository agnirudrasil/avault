from datetime import datetime
from datetime import timedelta
from datetime import timezone
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import set_access_cookies
from avault import snowflake
from argon2 import PasswordHasher
# import logging
# logging.basicConfig()
# logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
__version__ = (1, 0, 0, 'dev')

snowflake_id = snowflake.generator()
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
socketio = SocketIO(cors_allowed_origins=["http://localhost:3000"])
jwt = JWTManager()
cors = CORS()
ph = PasswordHasher()


def create_app():

    app = Flask(__name__)
    db_url = os.environ.get('DATABASE_URL')

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "dev"),
        SQLALCHEMY_DATABASE_URI=db_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=30),
        JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
        CORS_HEADERS='Content-Type',
        JWT_TOKEN_LOCATION=['cookies'],
        JWT_ACCESS_COOKIE_NAME="jwt",
        JWT_COOKIE_CSRF_PROTECT=False,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app, message_queue='redis://')
    cors.init_app(
        app, origins=["http://localhost:3000"], supports_credentials=True)

    from avault.users.views import bp
    from avault.guild.views import bp as guild_bp
    from avault.channels.views import bp as channel_bp
    from avault.messages.views import bp as message_bp
    app.register_blueprint(bp)
    app.register_blueprint(guild_bp)
    app.register_blueprint(channel_bp)
    app.register_blueprint(message_bp)

    @app.after_request
    def refresh_expiring_jwts(response):
        try:
            exp_timestamp = get_jwt()["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                set_access_cookies(response, access_token)
            return response
        except (RuntimeError, KeyError):
            # Case where there is not a valid JWT. Just return the original respone
            return response

    return app
