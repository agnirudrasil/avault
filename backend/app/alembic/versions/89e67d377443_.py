"""empty message

Revision ID: 89e67d377443
Revises: 25bfe45f6c17
Create Date: 2022-05-15 20:48:40.558165

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '89e67d377443'
down_revision = '25bfe45f6c17'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('relationships',
    sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
    sa.Column('requester_id', sa.BigInteger(), nullable=False),
    sa.Column('addressee_id', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['addressee_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id', 'requester_id', 'addressee_id')
    )
    op.create_foreign_key(None, 'channels', 'messages', ['last_message_id'], ['id'], ondelete='SET NULL', use_alter=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'channels', type_='foreignkey')
    op.drop_table('relationships')
    # ### end Alembic commands ###
