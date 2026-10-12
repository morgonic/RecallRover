# functions and strategy classes for matching algorithm

from abc import ABC, abstractmethod
from database import WatchedProduct
from schemas import RecallDetails
from normalizers import normalize_upc

### matching strategy interface ###
class RecallMatchStrategy(ABC):
    @abstractmethod
    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass

### concrete matching strategies ###
class UPCMatchStrategy(RecallMatchStrategy):
    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        # normalize the watched_product upc
        watched_upc = normalize_upc(watched_product.product_upc)

        # return early if watched_upc is none
        if (watched_upc == None):
            return None

        # initialize empty list for recall upcs
        recall_upcs = []

        # loop through upcs in recall
        for upc in recall.ProductUPCs:
            # normalize upc
            normalized = normalize_upc(upc['UPC'])
            
            if (normalized != None):
                # add normalized upc to recall_upcs list
                recall_upcs.append(normalized)

        # return early if recall_upcs is empty
        if (len(recall_upcs) == 0):
            return None
        # check if the watched_product upc is in the list of recall upcs
        if watched_upc in recall_upcs:
            return 100.0
        else:
            return 0.0

class ModelMatchStrategy(RecallMatchStrategy):
    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass

class FuzzyMatchStrategy(RecallMatchStrategy):
    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass

### strategy context ###
class RecallMatcher:
    def __init__(self, strategy: RecallMatchStrategy):
        pass

    def set_strategy(self, strategy: RecallMatchStrategy):
        pass

    def execute(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass

### strategy client ###
class MatchStrategyPicker:
    def find_match(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass


# function for returning match labels based on confidence scores
def get_match_label(conf_score: float):
    label = ''
    # scores 90 or above get recalled
    if (conf_score >= 90):
        label = 'Recalled'
    # scores 70-89.9 get possible recall
    elif (90 > conf_score >= 70):
        label = 'Possible Recall'
    # scores below 70 get no match
    else:
        label = 'No match'
    
    return label

# for testing
if __name__ == '__main__':
    
    ### match label tests ###
    print('\n[Get Match Label]')
    print(f'Expecting Recalled: {get_match_label(95)}')
    print(f'Expecting Possible Recall: {get_match_label(89.5)}')
    print(f'Expecting No match: {get_match_label(63)}')


    ### match upc tests ###
    print('\n[UPCMatchStrategy]')
    watched_product = WatchedProduct(product_upc='0123456789')
    recall = RecallDetails(RecallID='12345', ProductUPCs=[
        {'UPC': '0001234567'}, 
        {'UPC': '00123456789'},
        {'UPC': '123456790'}
    ])
    upc_matcher = UPCMatchStrategy()
    match_score = upc_matcher.match(watched_product, recall)
    print(f'Expecting 100.0: {match_score}')

    watched_product = WatchedProduct(product_upc='0123456789')
    recall = RecallDetails(RecallID='12345', ProductUPCs=[
        {'UPC': '0001234567'},
        {'UPC': '123456790'}
    ])
    match_score = upc_matcher.match(watched_product, recall)
    print(f'Expecting 0.0: {match_score}')

    watched_product = WatchedProduct(product_upc=None)
    recall = RecallDetails(RecallID='12345', ProductUPCs=[
        {'UPC': '0001234567'},
        {'UPC': '123456790'}
    ])
    match_score = upc_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}')

    watched_product = WatchedProduct(product_upc='0123456789')
    recall = RecallDetails(RecallID='12345', ProductUPCs=[])
    match_score = upc_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}')

    ###