"""empty message

Revision ID: 54d94892285e
Revises: 3e8252438585
Create Date: 2021-12-09 22:42:26.652587

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '54d94892285e'
down_revision = '3e8252438585'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
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
    op.add_column('messages', sa.Column('webhook_id', sa.BigInteger(), nullable=True))
    op.create_foreign_key(None, 'messages', 'webhooks', ['webhook_id'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'messages', type_='foreignkey')
    op.drop_column('messages', 'webhook_id')
    op.drop_table('webhooks')
    # ### end Alembic commands ###