# functions for daily recall check

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from recall_helpers import get_last_check_date, build_recall
from cpsc_client import search_recalls
from database import async_session_maker, Recall, DailyCheckLog
from schemas import RecallDetails
import datetime as dt
import httpx
import asyncio

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
        await session.commit()
        return new_recalls_list
    else:
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