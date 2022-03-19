"""empty message

Revision ID: a209a7de4602
Revises: 
Create Date: 2022-03-18 10:05:14.918259

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a209a7de4602'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('permissions',
    sa.Column('permission', sa.Text(), nullable=False),
    sa.Column('value', sa.BigInteger(), nullable=False),
    sa.Column('title', sa.Text(), nullable=False),
    sa.PrimaryKeyConstraint('permission')
    )
    op.create_table('users',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('username', sa.String(length=80), nullable=False),
    sa.Column('password', sa.Text(), nullable=False),
    sa.Column('tag', sa.String(length=5), nullable=False),
    sa.Column('bot', sa.Boolean(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username', 'tag')
    )
    op.create_table('applications',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('name', sa.Text(), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('redirect_uris', sa.ARRAY(sa.Text()), nullable=False),
    sa.Column('owner_id', sa.BigInteger(), nullable=False),
    sa.Column('secret', sa.Text(), nullable=False),
    sa.Column('bot_id', sa.BigInteger(), nullable=True),
    sa.ForeignKeyConstraint(['bot_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('guilds',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('icon', sa.Text(), nullable=True),
    sa.Column('owner_id', sa.BigInteger(), nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('channels',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('type', sa.Enum('guild_text', 'dm', 'guild_category', 'guild_news', 'guild_public_thread', 'guild_private_thread', 'group_dm', name='channeltype'), nullable=False),
    sa.Column('guild_id', sa.BigInteger(), nullable=True),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('topic', sa.String(length=1024), nullable=True),
    sa.Column('nsfw', sa.Boolean(), nullable=False),
    sa.Column('last_message_timestamp', sa.DateTime(), nullable=True),
    sa.Column('owner_id', sa.BigInteger(), nullable=True),
    sa.Column('parent_id', sa.BigInteger(), nullable=True),
    sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['parent_id'], ['channels.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('guild_bans',
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('guild_id', sa.BigInteger(), nullable=False),
    sa.Column('reason', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'guild_id'),
    sa.UniqueConstraint('guild_id', 'user_id', name='guild_bans_guild_id_user_id_key')
    )
    op.create_table('guild_members',
    sa.Column('guild_id', sa.BigInteger(), nullable=False),
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('is_owner', sa.Boolean(), nullable=False),
    sa.Column('nickname', sa.String(length=80), nullable=True),
    sa.Column('permissions', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('guild_id', 'user_id')
    )
    op.create_table('roles',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('guild_id', sa.BigInteger(), nullable=False),
    sa.Column('name', sa.String(length=64), nullable=False),
    sa.Column('color', sa.Integer(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('permissions', sa.BigInteger(), nullable=False),
    sa.Column('mentionable', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('channel_members',
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('channel_id', 'user_id')
    )
    op.create_table('invites',
    sa.Column('id', sa.String(length=21), nullable=False),
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('max_age', sa.Integer(), nullable=False),
    sa.Column('max_uses', sa.Integer(), nullable=True),
    sa.Column('count', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('overwrites',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('type', sa.Integer(), nullable=False),
    sa.Column('allow', sa.BigInteger(), nullable=False),
    sa.Column('deny', sa.BigInteger(), nullable=False),
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', 'channel_id', 'type')
    )
    op.create_table('role_members',
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('guild_id', sa.BigInteger(), nullable=False),
    sa.Column('role_id', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name='role_members_role_id_fkey', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id', 'guild_id'], ['guild_members.user_id', 'guild_members.guild_id'], name='guild_members_role_fkey', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'guild_id', 'role_id')
    )
    op.create_table('thread_metadata',
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.Column('archived', sa.Boolean(), nullable=True),
    sa.Column('archive_timestamp', sa.DateTime(), nullable=True),
    sa.Column('auto_archive_duration', sa.Integer(), nullable=True),
    sa.Column('locked', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('channel_id')
    )
    op.create_table('webhooks',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('type', sa.Integer(), nullable=False),
    sa.Column('guild_id', sa.BigInteger(), nullable=True),
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.Column('user_id', sa.BigInteger(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('avatar', sa.String(length=2048), nullable=True),
    sa.Column('token', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('messages',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.Column('author_id', sa.BigInteger(), nullable=True),
    sa.Column('webhook_id', sa.BigInteger(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.Column('replies_to', sa.BigInteger(), nullable=True),
    sa.Column('edited_timestamp', sa.DateTime(), nullable=True),
    sa.Column('tts', sa.Boolean(), nullable=False),
    sa.Column('embeds', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('attachments', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['replies_to'], ['messages.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['webhook_id'], ['webhooks.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('pinned_messages',
    sa.Column('channel_id', sa.BigInteger(), nullable=False),
    sa.Column('message_id', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('channel_id', 'message_id')
    )
    op.create_table('reactions',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('message_id', sa.BigInteger(), nullable=True),
    sa.Column('user_id', sa.BigInteger(), nullable=True),
    sa.Column('reaction', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('message_id', 'user_id', 'reaction', name='_reaction_uc')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('reactions')
    op.drop_table('pinned_messages')
    op.drop_table('messages')
    op.drop_table('webhooks')
    op.drop_table('thread_metadata')
    op.drop_table('role_members')
    op.drop_table('overwrites')
    op.drop_table('invites')
    op.drop_table('channel_members')
    op.drop_table('roles')
    op.drop_table('guild_members')
    op.drop_table('guild_bans')
    op.drop_table('channels')
    op.drop_table('guilds')
    op.drop_table('applications')
    op.drop_table('users')
    op.drop_table('permissions')
    # ### end Alembic commands ###
