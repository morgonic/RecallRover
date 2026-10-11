# functions for daily recall check

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from recall_helpers import get_last_check_date, build_recall
from cpsc_client import search_recalls
from database import async_session_maker, Recall
from schemas import RecallDetails
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

    # convert recalls to RecallDetails models
    recall_list = []
    for recall in recalls:
        recall_list.append(RecallDetails.model_validate(recall))

    # store new recalls in db if not in db yet (recalls, recall_products)
    for recall in recall_list:
        sql_statement = select(Recall).where(Recall.recall_id == recall.RecallID)
        db_recall = await session.execute(sql_statement)
        db_recall = db_recall.scalars().first()

        if db_recall == None:
            recall = build_recall(recall)
            session.add(recall)
        
        await session.commit()

    ## TODO: save today's date in daily_check_logs

    return recall_list

### TEST function
async def test_new_recalls():
    async with async_session_maker() as session:
        new_recalls = await fetch_store_new_recalls(session)
        
        print('\n[New Recalls]')
        print(f'\nFirst new recall title: {new_recalls[0].Title}')
        print(f'First new recall date: {new_recalls[0].RecallDate}')
        print(f'First new recall publish date: {new_recalls[0].LastPublishDate}\n')
        print(f'\nLast new recall title: {new_recalls[-1].Title}')
        print(f'Last new recall date: {new_recalls[-1].RecallDate}')
        print(f'Last new recall publish date: {new_recalls[-1].LastPublishDate}\n')
        print(f'Number of new recalls: {len(new_recalls)}\n')

# for testing
if __name__ == '__main__':
    asyncio.run(test_new_recalls())