import mysql.connector as ms
import click
from flask import Flask
from flask import current_app, g
from flask.cli import with_appcontext


def init_app(app: Flask):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


def init_db():
    db = get_db()[0]

    with current_app.open_resource('schema.sql') as f:
        sql = f.read().decode('utf-8')
        db.execute(sql, multi=True)


@click.command('init-db')
@with_appcontext
def init_db_command():
    init_db()
    click.echo('Initialized the database')


def get_db():
    if 'db' not in g:
        g.connection = ms.connect(
            host='localhost',
            user="root",
            passwd="argha@1234",
            database="avault"
        )
        g.db = g.connection.cursor(dictionary=True)

    return g.db, g.connection


def close_db(e=None):
    db = g.pop('db', None)
    connection = g.pop('connection', None)

    if db is not None:
        db.close()
        connection.close()
