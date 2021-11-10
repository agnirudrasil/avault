from avault import db, snowflake_id

role_members = db.Table('role_members',
                        db.Column('member_id', db.BigInteger,
                                  db.ForeignKey('guild_members.id'), primary_key=True),
                        db.Column('role_id', db.BigInteger,
                                  db.ForeignKey('roles.id'), primary_key=True)
                        )


class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.BigInteger, primary_key=True)
    guild_id = db.Column(db.BigInteger, db.ForeignKey(
        'guilds.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    color = db.Column(db.Integer, nullable=False)
    position = db.Column(db.Integer, nullable=False)
    permissions = db.Column(db.BigInteger, nullable=False)
    mentionable = db.Column(db.Boolean, nullable=False)
    guild = db.relationship('Guild', backref='roles')
    members = db.relationship('GuildMembers', secondary=role_members,
                              lazy='subquery', backref=db.backref('roles', lazy=True))

    def __init__(self,
                 guild_id,
                 name,
                 color,
                 position,
                 permissions,
                 mentionable,
                 id=None):
        self.id = id if id is not None else next(snowflake_id)
        self.guild_id = guild_id
        self.name = name
        self.color = color
        self.position = position
        self.permissions = permissions
        self.mentionable = mentionable
