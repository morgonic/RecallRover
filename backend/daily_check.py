# functions for daily recall check

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from recall_helpers import get_last_check_date, build_recall
from cpsc_client import search_recalls
from matching import MatchStrategyPicker, get_match_label
from database import async_session_maker, Recall, DailyCheckLog, WatchedProduct
from schemas import RecallDetails
import datetime as dt
import httpx
import asyncio
import logging

# basic config for logger
logging.basicConfig(
    format="%(levelname)s [%(asctime)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO
)

# create error logger
logger = logging.getLogger(__name__)

# function for fetching new recalls and storing them in db
async def fetch_store_new_recalls(session: AsyncSession):
    # get last check date from daily_check_logs in db (or 90 days ago)
    last_date = await get_last_check_date(session)
    # search parameter starts search from last publish date
    search_params = {'LastPublishDateStart': last_date}

    # timeout behavior config for client
    # 5 seconds to connect, 60 to wait for response
    timeout = httpx.Timeout(60.0, connect=5.0)

    # call cpsc client to search using search parameters
    recalls = await search_recalls(search_params, timeout=timeout)

    recall_list = []
    new_recalls_list = []

    # convert recalls to RecallDetails models
    if recalls != None:
        for recall in recalls:
            recall_list.append(RecallDetails.model_validate(recall))

        # store new recalls in db if not in db yet (recalls, recall_products)
        for recall in recall_list:
            sql_statement = select(Recall).where(Recall.recall_id == recall.RecallID)
            db_recall = await session.execute(sql_statement)
            db_recall = db_recall.scalars().first()

            # if there is no recall in the db matching the recallid
            if db_recall == None:
                # build the db models
                new_recall = build_recall(recall)
                # add them to db
                session.add(new_recall)
                # add recalldetails model to new_recalls_list
                new_recalls_list.append(recall)
        

        # save today's date in daily_check_logs
        # select daily_check_logs table with id descending
        sql_statement = select(DailyCheckLog).order_by(DailyCheckLog.id.desc())
        daily_check_log = await session.execute(sql_statement)
        # last log is first in descending id order
        last_log = daily_check_log.scalars().first()

        # new check date is today
        today = dt.date.today().isoformat()
        new_date = DailyCheckLog(last_check_date=today)
        # if the last log is None or isn't today's date then add it to db
        if (last_log == None) or (last_log.last_check_date != today):
            session.add(new_date)
            logger.info(f'New last_check_date added: {new_date.last_check_date}')
        else:
            logger.info('The last_check_date was today\'s date.')
        await session.commit()
        logger.info(
            f'Number of recalls fetched: {len(recall_list)}\n' + 
            f'Number of new recalls added: {len(new_recalls_list)}\n'
        )
        return new_recalls_list
    else:
        logger.error('Daily check skipped, daily_check_log not updated.')
        return None

# helper function to score and label watched products from new recalls
async def score_label_watched_products(session: AsyncSession, new_recalls: list[RecallDetails]):
    # select all watched products from db
    sql_statement = select(WatchedProduct)
    watched_products = await session.execute(sql_statement)
    watched_products = watched_products.scalars().all()

    # create matchstrategypicker client
    client = MatchStrategyPicker()

    # rank labels
    label_rank = {
        'No match': 0,
        'Watching': 1,
        'Possible Recall': 2,
        'Recalled': 3
    }

    # initialize list of updated watched products
    updated_watch_list = []

    # loop through recalls and watched products
    for recall in new_recalls:
        for product in watched_products:
            # score each recall against each watched product
            score = client.find_match(product, recall)
            # label each watched product based on score
            label = get_match_label(score)
            # change watched product label/recall_id if match label is higher rank
            if (label_rank[label] > label_rank[product.status_label]):
                product.status_label = label
                product.recall_id = recall.RecallID
                # add watched product to updated list if it's not in there already
                if (product not in updated_watch_list):
                    updated_watch_list.append(product)
    
    ## TODO: send email to users with updated watch list products

    await session.commit()

    return updated_watch_list


# function to run the daily check with fetch_store_new_recalls
async def run_daily_check():
    async with async_session_maker() as session:
        new_recalls = await fetch_store_new_recalls(session)
        if (new_recalls != None):
            num_of_recalls = len(new_recalls)
            logger.info(f'Fetched and stored {num_of_recalls} recalls.')
            new_watch_list = await score_label_watched_products(session, new_recalls)
            logger.info(f'Updated watch list products (id/label): {[(product.id, product.status_label) for product in new_watch_list]}')
            return num_of_recalls
        else:
            logger.warning('New recall fetch returned None.')
            return None



### TEST function
async def test_new_recalls():
    async with async_session_maker() as session:
        new_recalls = await fetch_store_new_recalls(session)
        
        print('\n[New Recalls]')
        if (new_recalls != None):
            if (len(new_recalls) > 0):
                print(f'\nFirst new recall title: {new_recalls[0].Title}')
                print(f'First new recall date: {new_recalls[0].RecallDate}')
                print(f'First new recall publish date: {new_recalls[0].LastPublishDate}\n')
                print(f'\nLast new recall title: {new_recalls[-1].Title}')
                print(f'Last new recall date: {new_recalls[-1].RecallDate}')
                print(f'Last new recall publish date: {new_recalls[-1].LastPublishDate}\n')
                print(f'Number of new recalls: {len(new_recalls)}\n')
            else:
                print('No new recalls.')
        else:
            print('Error retrieving Recalls: The underlying provider failed on Open.')

# for testing
if __name__ == '__main__':
    asyncio.run(test_new_recalls())