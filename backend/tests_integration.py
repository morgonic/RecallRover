# integration test file for backend

import pytest
import pytest_asyncio
import json
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from httpx import ASGITransport, AsyncClient
from recall_helpers import build_recall
from database import Base, get_async_session
from schemas import RecallDetails
from main import app



# ========================================== #
### asyncio fixtures for integration tests ###
# ========================================== #

# fixture to create test db with pytest's tmp_path fixture
@pytest_asyncio.fixture
async def test_engine(tmp_path):
    # creates async db engine with temp db
    engine = create_async_engine(f'sqlite+aiosqlite:///{tmp_path / 'test.db'}')
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    # cleanup engine after test
    await engine.dispose()

# fixture to create test sessionmaker using test_engine fixture
@pytest_asyncio.fixture
async def test_session_maker(test_engine):
    return async_sessionmaker(test_engine, expire_on_commit=False)

# fixture to create test client using test_session_maker to override app's get_async_session
@pytest_asyncio.fixture
async def test_client(test_session_maker):
    # replaces get_async_session to use test db
    async def override_get_async_session() -> AsyncGenerator[AsyncSession, None]:
        async with test_session_maker() as session:
            yield session

    # override app's get_async_session to use test db instead of real db
    app.dependency_overrides[get_async_session] = override_get_async_session

    # ASGITransport to request fastapi directly without running server
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as ac:
        yield ac
    
    # clear dependency override afterward
    app.dependency_overrides.clear()

# fixture to save sample recalls to test db
@pytest_asyncio.fixture
async def test_save_recalls(test_session_maker):
    # use test_session_maker to use tmp_path test db
    async with test_session_maker() as session:
        # open saved sample json
        with open('./test_sample_json.json') as file:
            recalls = json.load(file)
            # loop through recalls from json
            for recall in recalls:
                # build Recall db models from RecallDetails
                recall_details = RecallDetails.model_validate(recall)
                db_recall = build_recall(recall_details)
                # add to test db session
                session.add(db_recall)
            await session.commit()

# ========================================== #
### endpoint integration tests ###
# ========================================== #

# testing searching by upc with empty db, call succeeds but returns nothing
@pytest.mark.asyncio
async def test_search_by_upc_empty_db(test_client):
    response = await test_client.get('/recalls/search/091021037090')
    assert response.status_code == 200
    assert response.json() == []

# testing searching by upc with test db of saved sample recalls
@pytest.mark.asyncio
async def test_search_by_upc_in_db(test_client, test_save_recalls):
    # search for upc that's in RecallID 8877 for Thule Sleek strollers
    response = await test_client.get('/recalls/search/091021037090')
    # get status_code from response
    status_code = response.status_code
    # get recalls from json
    recalls = response.json()
    # returns as list of recalls even though there should only be 1, get RecallIDs
    recall_ids = [recall['RecallID'] for recall in recalls]
    # should give successful response and only have 1 recall: RecallID 8877
    assert status_code == 200
    assert 8877 in recall_ids
    assert len(recalls) == 1

# testing getting recalldetails by recallid from test db
@pytest.mark.asyncio
async def test_get_recall_details(test_client, test_save_recalls):
    # get recalldetails for RecallID 8877 (Thule Sleek strollers)
    response = await test_client.get('/recalls/8877')
    # get status_code from rresponse
    status_code = response.status_code
    # get recall details from json
    recall_details = response.json()
    # store RecallID
    recall_id = recall_details['RecallID']
    # store recall Title
    recall_title = recall_details['Title']
    # store first product's name
    product_name = recall_details['Products'][0]['Name']
    # should give successful response,
    assert status_code == 200
    # RecallID 8877,
    assert recall_id == 8877
    # Title as Thule Recalls Strollers Due to Injury Hazard,
    assert recall_title == 'Thule Recalls Strollers Due to Injury Hazard'
    # and Product Name as 'Thule Sleek strollers'
    assert product_name == 'Thule Sleek strollers'