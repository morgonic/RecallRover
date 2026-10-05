# main FastAPI server file

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables, User
from contextlib import asynccontextmanager
from schemas import UserRead, UserCreate, UserUpdate
from users import auth_backend, current_active_user, fastapi_users
from dotenv import load_dotenv
import os

# loading environment variables from .env file
load_dotenv()

# lifespan for FastAPI app, creates database/tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

# FastAPI app instance with lifespan
app = FastAPI(lifespan=lifespan)

# origins for corsmiddleware
origins = [os.getenv('CORS_ORIGINS')]

# corsmiddleware for frontend/backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# test endpoint to check if server is running
@app.get("/")
async def root():
    return {"message": "FastAPI server is running."}



## FastAPI Users routes ##

# router for /auth/jwt/login and /auth/jwt/logout endpoints
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"]
)
# router for /auth/register endpoint
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"]
)
## OPTIONAL: reset password functionality might be added later
# router for /auth/forgot-password and /auth/reset-password endpoints
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"]
)
# router for /users endpoints
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"]
)

@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}