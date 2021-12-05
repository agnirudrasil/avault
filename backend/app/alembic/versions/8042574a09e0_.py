"""empty message

Revision ID: 8042574a09e0
Revises: 
Create Date: 2021-11-21 18:19:30.523817

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8042574a09e0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('role_members_role_id_fkey', 'role_members', type_='foreignkey')
    op.drop_constraint('role_members_user_id_guild_id_fkey', 'role_members', type_='foreignkey')
    op.create_foreign_key('guild_members_role_fkey', 'role_members', 'guild_members', ['user_id', 'guild_id'], ['user_id', 'guild_id'], ondelete='CASCADE')
    op.create_foreign_key('role_members_role_id_fkey', 'role_members', 'roles', ['role_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('role_members_role_id_fkey', 'role_members', type_='foreignkey')
    op.drop_constraint('guild_members_role_fkey', 'role_members', type_='foreignkey')
    op.create_foreign_key('role_members_user_id_guild_id_fkey', 'role_members', 'guild_members', ['user_id', 'guild_id'], ['user_id', 'guild_id'])
    op.create_foreign_key('role_members_role_id_fkey', 'role_members', 'roles', ['role_id'], ['id'])
    # ### end Alembic commands ###