# CPSC Recalls API web client file

import httpx
import asyncio
import logging

# create error logger
logger = logging.getLogger(__name__)

# base URL to search recalls from CPSC Recalls API
CPSC_URL = 'https://www.saferproducts.gov/RestWebServices/Recall'

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

# function to search recalls and return result list
async def search_recalls(params, timeout=timeout):
    # delete keys with empty values to avoid breaking API call
    delete_empty_params(params)
    # add json format to params
    params.update({'format': 'json'})
    # create async web client
    async with httpx.AsyncClient() as client:
        # build request
        request = client.build_request('GET', CPSC_URL, params=params, timeout=timeout)
        
        try:
            # send request
            response = await client.send(request)
            # raise exception for error status
            response.raise_for_status()
            # return json list
            return response.json()
        except httpx.HTTPError as exc:
            logger.error(f'HTTP Exception for {exc.request.url} - {type(exc).__name__}: {exc}')
            return []
        except ValueError as exc:
            logger.error(f'Invalid JSON response for {request.url} - {type(exc).__name__}: {exc}')
            return []

# for test runs
if __name__ == '__main__':
    logging.basicConfig(
        format="%(levelname)s [%(asctime)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        level=logging.INFO
    )
    # test parameters for test search function with client
    test_params = {
        'ProductName': 'grill brush',
        'UPC': '',
        'RecallDateStart': '2026-01-01',
        'RecallDateEnd' : ''
    }
    # test parameters for product name only
    test_product_name = {'ProductName': 'Thule Sleek Car Seat Adapters'}
    # test parameters for upc only
    # DOES NOT WORK FOR SOME REASON
    test_upc = {'UPC': '091021188099'}
    # test parameters for date range only
    test_date_range = {
        'RecallDateStart': '2026-08-01',
        'RecallDateEnd' : '2026-10-06'
    }
    all_params_test = asyncio.run(search_recalls(test_params, timeout))
    product_name_test = asyncio.run(search_recalls(test_product_name, timeout))
    date_range_test = asyncio.run(search_recalls(test_date_range, timeout))
    upc_test = asyncio.run(search_recalls(test_upc, timeout))
    print(f'[All Params]\nNumber of recalls: {len(all_params_test)}')
    if (len(all_params_test) != 0): 
        print(f'First recall title: {all_params_test[0]['Title']}')
    else:
        print('No recalls found.')
    print(f'[Product Name]\nNumber of recalls: {len(product_name_test)}')
    if (len(product_name_test) != 0): 
        print(f'First recall title: {product_name_test[0]['Title']}')
    else:
        print('No recalls found.')
    print(f'[Date Range]\nNumber of recalls: {len(date_range_test)}')
    if (len(date_range_test) != 0): 
        print(f'First recall title: {date_range_test[0]['Title']}')
    else:
        print('No recalls found.')
    print(f'[UPC]\nNumber of recalls: {len(upc_test)}')
    if (len(upc_test) != 0): 
        print(f'First recall title: {upc_test[0]['Title']}')
    else:
        print('No recalls found.')
    # timeout test
    test_timeout = httpx.Timeout(0.001)
    timeout_test = asyncio.run(search_recalls(test_params, test_timeout))
    print(f'[Timeout Test]\nNumber of recalls: {len(timeout_test)}')