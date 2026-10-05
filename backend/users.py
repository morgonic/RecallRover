# FastAPI Users user management and authentication backend file

import uuid
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from database import User, get_user_db
from dotenv import load_dotenv
import os

# loading environment variables from .env file
load_dotenv()

# getting JWT secret from .env file
SECRET = os.getenv("JWT_SECRET")

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"User {user.id} has registered.")

    async def on_after_login(self, user: User, request: Request | None = None, response: Response | None = None):
        print(f"User {user.id} has logged in.")

    ## OPTIONAL: reset password functionality might be added later
    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None):
        print(f"User {user.id} has forgotten their password. Reset token: {token}")

# function for getting user manager
async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

# Bearer transport for JWT authentication
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

# function for getting JWT strategy
def get_jwt_strategy() -> JWTStrategy[models.UP, models.ID]:
    return JWTStrategy(secret=SECRET, lifetime_seconds=10)

# FastAPI Users authentication backend setup
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy
)

# FastAPI Users instance setup
fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

# dependency for getting current active user
current_active_user = fastapi_users.current_user(active=True)