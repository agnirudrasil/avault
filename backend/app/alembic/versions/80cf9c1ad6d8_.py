"""empty message

Revision ID: 80cf9c1ad6d8
Revises: ebc461d6915c
Create Date: 2022-05-20 17:24:54.493122

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '80cf9c1ad6d8'
down_revision = 'ebc461d6915c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('channels', sa.Column('icon', sa.Text(), nullable=True))
    op.alter_column('channels', 'name',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('channels', 'name',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)
    op.drop_column('channels', 'icon')
    # ### end Alembic commands ###
