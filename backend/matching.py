# functions for matching algorithm

from abc import ABC, abstractmethod
from database import WatchedProduct
from schemas import RecallDetails

### matching strategy interface ###
class RecallMatchStrategy(ABC):
    @abstractmethod
    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass

### concrete matching strategies ###
class UPCMatchStrategy(RecallMatchStrategy):
    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        pass

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