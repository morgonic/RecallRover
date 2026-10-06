# CPSC Recalls API web client file

import httpx
import asyncio
import logging

# create error logger
logger = logging.getLogger(__name__)

# base URL to search recalls from CPSC Recalls API
CPSC_URL = 'https://www.saferproducts.gov/RestWebServices/Recall'

# test parameters for test search function with client
test_params = {
    'ProductName': 'grill brush',
    'UPC': '',
    'RecallDateStart': '2026-01-01',
    'RecallDateEnd' : ''
}
# test parameters for product name only
test_product_name = {'ProductName': 'grill brush'}
# test parameters for upc only
# DOES NOT WORK FOR SOME REASON
test_upc = {'UPC': '680079015930'}
# test parameters for date range only
test_date_range = {
    'RecallDateStart': '2026-08-01',
    'RecallDateEnd' : '2026-10-06'
}

# timeout behavior config for client
# 5 seconds to connect, 10 for everything else
timeout = httpx.Timeout(10.0, connect=5.0)

# function to delete any parameters with empty value
# including empty value in search term makes API return nothing
def delete_empty_params(params):
    keys_to_delete = []
    for key, val in params.items():
        if (val == ''):
            keys_to_delete.append(key)
    for key in keys_to_delete:
            del params[key]

# test function to test search recalls
async def test_search_recalls(params, timeout=timeout):
    # delete keys with empty values to avoid breaking API call
    delete_empty_params(params)
    # add json format to params
    params.update({'format': 'json'})
    # create async web client
    async with httpx.AsyncClient() as client:
        # build request
        request = client.build_request('GET', CPSC_URL, params=params, timeout=timeout)
        # convert request url to string and print for testing
        request_url = str(request.url)
        print(request_url)

        try:
            # send request
            response = await client.send(request)
            # raise exception for error status
            response.raise_for_status()
            # return json list
            return response.json()
        except httpx.HTTPError as exc:
            logger.error(f'HTTP Exception for {exc.request.url} - {exc}')
            return []
        except ValueError as exc:
            logger.error(f'Invalid JSON response for {request.url} - {exc}')
            return []

if __name__ == '__main__':
    logging.basicConfig(
        format="%(levelname)s [%(asctime)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        level=logging.INFO
    )
    asyncio.run(test_search_recalls(test_params, timeout))
