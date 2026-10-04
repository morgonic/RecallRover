# main FastAPI server file

from fastapi import FastAPI
from database import create_db_and_tables
from contextlib import asynccontextmanager

# lifespan for FastAPI app, creates database/tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

# FastAPI app instance with lifespan
app = FastAPI(lifespan=lifespan)

# test endpoint to check if server is running
@app.get("/")
async def root():
    return {"message": "FastAPI server is running."}