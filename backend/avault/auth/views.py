import os
import datetime

from flask import Blueprint, jsonify
from avault.snowflake import snowflake_to_timestamp, generator

bp = Blueprint('auth', __name__, url_prefix='/auth')
snowflake_id = generator()


@bp.route('/login', methods=['GET', 'POST'])
def login():
    pass


@bp.route('/snowflake', methods=['GET'])
def snowflake():
    my_snowflake_id = next(snowflake_id)
    timestamp = str(datetime.datetime.fromtimestamp(
        snowflake_to_timestamp(my_snowflake_id)))
    return jsonify({'id': my_snowflake_id, 'timestamp': timestamp})
