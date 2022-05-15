"""empty message

Revision ID: 1ef8e409536c
Revises: 89e67d377443
Create Date: 2022-05-15 21:51:26.040530

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1ef8e409536c'
down_revision = '89e67d377443'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('relationships', sa.Column('type', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('relationships', 'type')
    # ### end Alembic commands ###
