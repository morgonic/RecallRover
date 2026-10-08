# SQLite database setup file

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, JSON
from collections.abc import AsyncGenerator
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from fastapi import Depends

# base class for SQLAlchemy models to inherit from
class Base(DeclarativeBase):
    pass

# fastapi users user model class for db
class User(SQLAlchemyBaseUserTableUUID, Base):
    pass

### Recall models ###

class Recall(Base):
    __tablename__ = 'recalls'

    recall_id: Mapped[int] = mapped_column(primary_key=True)
    recall_number: Mapped[str | None] = mapped_column(String(100))
    recall_date: Mapped[str | None] = mapped_column(String(30))
    last_publish_date: Mapped[str | None] = mapped_column(String(30))
    title: Mapped[str | None] = mapped_column(String())
    description: Mapped[str | None] = mapped_column(String())
    url: Mapped[str | None] = mapped_column(String())
    consumer_contact: Mapped[str | None] = mapped_column(String())
    products: Mapped[list['RecallProduct']] = relationship(back_populates='recall')
    product_upcs: Mapped[list[dict] | None] = mapped_column(JSON)
    images: Mapped[list[dict] | None] = mapped_column(JSON)
    hazards: Mapped[list[dict] | None] = mapped_column(JSON)
    injuries: Mapped[list[dict] | None] = mapped_column(JSON)
    remedies: Mapped[list[dict] | None] = mapped_column(JSON)
    remedy_options: Mapped[list[dict] | None] = mapped_column(JSON)
    manufacturers: Mapped[list[dict] | None] = mapped_column(JSON)
    retailers: Mapped[list[dict] | None] = mapped_column(JSON)
    importers: Mapped[list[dict] | None] = mapped_column(JSON)
    distributors: Mapped[list[dict] | None] = mapped_column(JSON)

class RecallProduct(Base):
    __tablename__ = 'recall_products'

    id: Mapped[int] = mapped_column(primary_key=True)
    recall_id: Mapped[int] = mapped_column(ForeignKey('recalls.recall_id'))
    recall: Mapped['Recall'] = relationship(back_populates='products')
    product_name: Mapped[str | None] = mapped_column(String())
    product_description: Mapped[str | None] = mapped_column(String())
    product_model: Mapped[str | None] = mapped_column(String(100))
    product_type: Mapped[str | None] = mapped_column(String(100))
    upcs: Mapped[list[str] | None] = mapped_column(JSON)
    category_id: Mapped[str | None] = mapped_column(String(100))

class DailyCheckLog(Base):
    __tablename__ = 'daily_check_logs'

    id: Mapped[int] = mapped_column(primary_key=True)
    last_check_date: Mapped[str | None] = mapped_column(String(30))

### Watched Product models ###

class WatchedProduct(Base):
    __tablename__ = 'watched_products'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey('user.id'))
    status_label: Mapped[str] = mapped_column(String(), default='Watching')
    product_name: Mapped[str | None] = mapped_column(String())
    product_brand: Mapped[str | None] = mapped_column(String())
    product_model: Mapped[str | None] = mapped_column(String())
    product_upc: Mapped[str | None] = mapped_column(String())

# SQLite db file name and url
sqlite_file_name = "recallrover.db"
SQLITE_URL = f"sqlite+aiosqlite:///./{sqlite_file_name}"

# creating async engine and session maker for db
async_engine = create_async_engine(SQLITE_URL)
async_session_maker = async_sessionmaker(async_engine, expire_on_commit=False)

# function for creating database and tables
async def create_db_and_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# function for getting the async session for db
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

# function for getting user db for fastapi users
async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)