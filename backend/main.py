# main FastAPI server file

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables, User, get_async_session, WatchedProduct, Recall
from contextlib import asynccontextmanager
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from schemas import (
    UserRead, UserCreate, UserUpdate, 
    RecallDetails, RecallSummary, RecallProductDetails,
    WatchedProductRead, WatchedProductCreate
)
from users import auth_backend, current_active_user, fastapi_users
from cpsc_client import search_recalls
from recall_helpers import build_recall_summary, build_recall, build_recall_details
from scheduler import start_scheduler, stop_scheduler
from daily_check import run_daily_check
from dotenv import load_dotenv
import os
import logging
import datetime as dt

# loading environment variables from .env file
load_dotenv()

# lifespan for FastAPI app
# on startup: creates db/tables, starts apscheduler
# on shutdown: stops apscheduler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    await create_db_and_tables()
    await start_scheduler()
    yield
    # on shutdown
    await stop_scheduler()

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


## Daily recall check routes ##

# manually run daily check, endpoint protected by user auth
@app.post('/recalls/daily-check', tags=['recalls'])
async def run_manual_daily_check(user: User = Depends(current_active_user)):
    # log who ran the check
    logger.info(f'User email {user.email} called run_manual_daily_check.')
    # for now, run_daily_check returns the length of the new recalls
    num_of_new_recalls = await run_daily_check()
    # return the number of new recalls stored
    if (num_of_new_recalls != None):
        return {'num_of_new_recalls': num_of_new_recalls}
    # if None is returned, raise exception for bad gateway
    else:
        raise HTTPException(status_code=502, detail='Daily check failed to reach CPSC Recalls API.')


## Recalls routes ##

# recall feed endpoint
@app.get('/recalls/feed', response_model=list[RecallSummary], tags=['recalls'])
async def get_recall_feed(
    session: AsyncSession = Depends(get_async_session),
    limit: int = 20, 
    offset: int = 0
):
    # get limited recalls (default 20) from the db
    # descend by date and then recallID (for recalls on same date)
    # load products at the same time
    # offset will be used for Load More button
    sql_statement = (
        select(Recall)
        .order_by(Recall.recall_date.desc())
        .order_by(Recall.recall_id.desc())
        .limit(limit)
        .offset(offset)
        .options(selectinload(Recall.products))
    )
    recalls = await session.execute(sql_statement)
    recalls = recalls.scalars().all()

    # initialize empty list for RecallSummary objects
    recall_summaries = []

    # loop through recalls from db
    for recall in recalls:
        # build RecallDetails and RecallSummary models
        details = build_recall_details(recall)
        summary = build_recall_summary(details)
        # add RecallSummary to list
        recall_summaries.append(summary)

    return recall_summaries
    


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
    if recalls == None:
        logger.error('Searching recalls failed.')
        # exception with 502 bad gateway status code
        raise HTTPException(status_code=502, detail='Failed to get recalls from CPSC Recalls API.')
    summaries = []
    # build recalldetails and recallsummary for each recall
    for recall in recalls:
        details = RecallDetails.model_validate(recall)

        summary = build_recall_summary(details)
        # add summary to list of summaries
        summaries.append(summary)
    # return list of summaries
    return summaries

# get recall details by recall_id endpoint
@app.get('/recalls/{recall_id}', response_model=RecallDetails, tags=['recalls'])
async def get_recall_details(
    recall_id: int, 
    session: AsyncSession = Depends(get_async_session)
):
    # try to get recall from db
    # selectinload to fix missinggreenlet sqlalchemy error, load products in same query
    sql_statement = select(Recall).where(Recall.recall_id == recall_id).options(selectinload(Recall.products))
    recall = await session.execute(sql_statement)
    recall = recall.scalars().first()

    # if db returns the recall, build recalldetails pydantic model for endpoint response_model
    if (recall != None):
        recall_details = build_recall_details(recall)
        return recall_details
    # if db does not return recall
    else:
        # search for it by RecallID
        search_params = {'RecallID': recall_id}
        cpsc_recall = await search_recalls(params=search_params)
        # if cpsc returns None, the fetch failed
        if (cpsc_recall == None):
            logger.warning('HTTPException 502, bad gateway.')
            raise HTTPException(status_code=502, detail='Failed to get recall from CPSC Recalls API.')
        # if it was an empty list, the fetch succeeded but did not return anything
        elif (cpsc_recall == []):
            logger.warning('HTTPException 404, recall not found.')
            raise HTTPException(status_code=404, detail='Recall not found.')
        # otherwise build the recalldetails model, add to db
        else:
            recall_details = RecallDetails.model_validate(cpsc_recall[0])
            recall = build_recall(recall_details)
            session.add(recall)
            await session.commit()
            logger.info(f'Recall {recall_id} added to DB.')
            return recall_details
            


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

# get watched products endpoint for displaying in watch list
@app.get('/watched-products', response_model=list[WatchedProductRead], tags=['watched-products'])
async def get_watched_products(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    sql_statement = select(WatchedProduct).where(WatchedProduct.user_id == str(user.id))

    watched_products = await session.execute(sql_statement)
    watched_products = watched_products.scalars().all()

    return watched_products

# delete watched product endpoint to remove specific item from watch list
@app.delete('/watched-products/{product_id}', tags=['watched-products'])
async def remove_watched_product(
    product_id: int,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    sql_statement = select(WatchedProduct).where(and_(
        WatchedProduct.user_id == str(user.id),
        WatchedProduct.id == product_id
    ))

    watched_product = await session.execute(sql_statement)
    watched_product = watched_product.scalars().first()

    await session.delete(watched_product)
    await session.commit()

    logger.info(f'Watched product {product_id} was removed from the database.')

@app.patch('/watched-products/{product_id}', response_model=WatchedProductRead, tags=['watched-products'])
async def edit_watched_product(
    product_id: int,
    data: WatchedProductCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    sql_statement = select(WatchedProduct).where(and_(
        WatchedProduct.user_id == str(user.id),
        WatchedProduct.id == product_id
    ))

    watched_product = await session.execute(sql_statement)
    watched_product = watched_product.scalars().first()

    edits = data.model_dump(exclude_unset=True)

    for key, val in edits.items():
        setattr(watched_product, key, val)

    await session.commit()
    await session.refresh(watched_product)

    logger.info(f'Watched product {product_id} updated in the database.')

    return watched_product