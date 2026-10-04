# SQLite database setup file

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from collections.abc import AsyncGenerator
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from fastapi import Depends

# base class for SQLAlchemy models to inherit from
class Base(DeclarativeBase):
    pass

# fastapi users user model class for db
class User(SQLAlchemyBaseUserTableUUID, Base):
    pass

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