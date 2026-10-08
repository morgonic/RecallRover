# main FastAPI server file

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables, User, get_async_session, WatchedProduct
from contextlib import asynccontextmanager
from schemas import (
    UserRead, UserCreate, UserUpdate, 
    RecallDetails, RecallSummary, 
    WatchedProductRead, WatchedProductCreate
)
from users import auth_backend, current_active_user, fastapi_users
from cpsc_client import search_recalls
from recall_helpers import build_recall_summary
from dotenv import load_dotenv
import os
import logging
import datetime as dt

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

# basic config for logger
logging.basicConfig(
    format="%(levelname)s [%(asctime)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


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

# test endpoint to check if server is running
@app.get("/")
async def root():
    return {"message": "FastAPI server is running."}

@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}


## Recalls routes ##

# search endpoint
@app.get('/recalls/search', response_model=list[RecallSummary], tags=['recalls'])
async def search_cpsc_recalls(
    product_name: str | None = None, 
    product_model: str | None = None, 
    product_brand: str | None = None, 
    product_upc: str | None = None,
    recall_date_start: str | None = None,
    recall_date_end: str | None = None
):
    # all search terms empty, log warning, raise exception
    if (
        (product_name == None) &
        (product_model == None) &
        (product_brand == None) &
        (product_upc == None) &
        (recall_date_start == None) &
        (recall_date_end == None)
    ):
        logger.warning('Search prevented for no search terms.')
        raise HTTPException(status_code=400, detail='Needs at least one search term.')

    # if no date range, set to last 20 years
    if ((recall_date_start == None) & (recall_date_end == None)):
        recall_date_end = dt.date.today()
        recall_date_start = recall_date_end.replace(year=recall_date_end.year - 20)
        recall_date_end = recall_date_end.isoformat()
        recall_date_start = recall_date_start.isoformat()

    # build search parameters
    search_params = {
        'ProductName': product_name,
        'ProductModel': product_model,
        'RecallTitle': product_brand,
        'UPC': product_upc,
        'RecallDateStart': recall_date_start,
        'RecallDateEnd': recall_date_end
    }

    # call cpsc client to search using search parameters
    recalls = await search_recalls(search_params)
    summaries = []
    # build recalldetails and recallsummary for each recall
    for recall in recalls:
        details = RecallDetails.model_validate(recall)

        summary = build_recall_summary(details)
        # add summary to list of summaries
        summaries.append(summary)
    # return list of summaries
    return summaries


## Watched Products routes ##

# save watched product endpoint
@app.post('/watched-products', response_model=WatchedProductRead, tags=['watched-products'])
async def save_watched_product(
    data: WatchedProductCreate,
    user: User = Depends (current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if (
        (data.product_name == '') &
        (data.product_brand == '') &
        (data.product_model == '') &
        (data.product_upc == '')
    ):
        logger.warning('Cannot save product with no data.')
        raise HTTPException(status_code=400, detail='Needs at least one data field.')
    
    product = WatchedProduct(**data.model_dump(), user_id=str(user.id))
    session.add(product)
    await session.commit()
    await session.refresh(product)

    logger.info(f'Watched product {product.id} was saved to the database.')

    return product