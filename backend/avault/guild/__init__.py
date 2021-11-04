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

    def serialize(self):
        return {
            "id": str(self.id),
            "guild_id": self.guild_id,
            "user": self.member.serialize(),
            "nickname": self.nickname
        }

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
    channels = db.relationship('Channel')

    def is_owner(self, member: GuildMembers):
        return member.user_id == self.owner_id

    def preview(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "icon": self.icon,
        }

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "icon": self.icon,
            "owner": self.owner.serialize(),
            "members": [member.serialize() for member in self.members],
            "channels": [channel.serialize() for channel in self.channels]
        }

    def __init__(self, name, owner_id, icon=None):
        self.id = next(snowflake_id)
        self.name = name
        self.owner_id = owner_id
        self.icon = icon
