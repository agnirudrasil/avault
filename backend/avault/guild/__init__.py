from avault import db, snowflake_id


class GuildMembers(db.Model):
    __tablename__ = "guild_members"
    id = db.Column(db.BigInteger, primary_key=True)
    guild_id = db.Column(db.BigInteger, db.ForeignKey(
        "guilds.id"), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey(
        "users.id"), nullable=False)
    nickname = db.Column(db.String(80), nullable=True)
    member = db.relationship('User', back_populates="guilds")
    guild = db.relationship('Guild', back_populates="members")

    def __init__(self, nickname=None):
        self.id = next(snowflake_id)
        self.nickname = nickname


class Guild(db.Model):
    __tablename__ = "guilds"

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    icon = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    owner = db.relationship('User', backref='owner')
    members = db.relationship('GuildMembers', back_populates="guild")

    def __init__(self, name, owner_id, icon=None):
        self.id = next(snowflake_id)
        self.name = name
        self.owner_id = owner_id
        self.icon = icon
