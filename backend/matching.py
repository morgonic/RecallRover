# functions and strategy classes for matching algorithm

from abc import ABC, abstractmethod
from database import WatchedProduct
from schemas import RecallDetails
from normalizers import normalize_upc, normalize_model, normalize_text
from rapidfuzz import fuzz

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
        # normalize the watched_product model
        watched_model = normalize_model(watched_product.product_model)

        # return early if watched_model is none
        if (watched_model == None):
            return None
        
        # initialize empty list for recall models
        recall_models = []
        # bool to flag if any product model is not none/empty
        model_present = False

        # loop through products in recall
        for product in recall.Products:
            # normalize the model
            normalized = normalize_model(product.Model)

            if (normalized != None):
                # flag that model is present
                model_present = True
                # add normalized model to recall_models list
                recall_models.append(normalized)

            # split product name into tokens to search for model in name
            name_tokens = (product.Name).split()
            # loop through product name tokens
            for token in name_tokens:
                # normalize each token
                normalized_token = normalize_model(token)
                # add token to recall_models if it's not none, 
                # longer than 3 chars, 
                # and has digit
                if (
                    (normalized_token != None) and 
                    (len(normalized_token) > 3) and
                    (any(char.isdigit() for char in normalized_token))
                ):
                    recall_models.append(normalized_token)
        
        # return early if recall_models is empty
        if (len(recall_models) == 0):
            return None
        # 100.0 if the watched_model is in the list of recall_models
        if watched_model in recall_models:
            return 100.0
        # 0.0 if model is not in recall_models and a product.Model is present
        elif (watched_model not in recall_models) and (model_present):
            return 0.0
        # none if watched_model is not in recall_models and no recall products had models
        else:
            return None

class FuzzyMatchStrategy(RecallMatchStrategy):
    # name_weight and brand_weight are attributes in init
    def __init__(self, name_weight=0.7, brand_weight=0.3):
        self.name_weight = name_weight
        self.brand_weight = brand_weight

    def match(self, watched_product: WatchedProduct, recall: RecallDetails):
        # normalize the watched product name
        normal_name = normalize_text(watched_product.product_name)
        # normalize the watched product brand
        normal_brand = normalize_text(watched_product.product_brand)

        # initialize variables for scores
        name_score = None
        brand_score = None
        fuzzy_score = None

        # initialize list of product names/brands
        recall_names = []
        recall_brands = []

        # loop through recall products to normalize and collect names
        for product in recall.Products:
            normal_recall_name = normalize_text(product.Name)
            if (normal_recall_name != None):
                recall_names.append(normal_recall_name)

        # only score if watched_product has a product name
        if (normal_name != None):
            # get the fuzzy name score
            for name in recall_names:
                score = fuzz.token_set_ratio(normal_name, name)
                if (name_score == None) or (score > name_score):
                    name_score = score

        # normalize and collect brands from titles
        normal_title = normalize_text(recall.Title)
        if (normal_title != None):
            recall_brands.append(normal_title)
        # normalize and collect brands from manufacturers
        for manufacturer in recall.Manufacturers:
            normal_manuf = normalize_text(manufacturer['Name'])
            if (normal_manuf != None):
                recall_brands.append(normal_manuf)

        # only score if watched_product has a brand
        if (normal_brand != None):
            # get the fuzzy brand score
            for brand in recall_brands:
                score = fuzz.token_set_ratio(normal_brand, brand)
                # set brand_score if it's none or less than the current score
                if (brand_score == None) or (score > brand_score):
                    brand_score = score

        # check if name only or brand only
        name_only = (name_score != None) and (brand_score == None)
        brand_only = (brand_score != None) and (name_score == None)

        # combine name and brand scores
        if (name_score != None) and (brand_score != None):
            # apply weights
            name_score *= self.name_weight
            brand_score *= self.brand_weight
            # combine
            fuzzy_score = name_score + brand_score
        # only return name score if name only
        if name_only:
            fuzzy_score = name_score
        # only return brand score if brand only
        if brand_only:
            # apply weight
            brand_score *= self.brand_weight
            fuzzy_score = brand_score
        
        return fuzzy_score

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

    ### match model tests ###
    print('\n[ModelMatchStrategy]')
    watched_product = WatchedProduct(product_model='abc123')
    recall = RecallDetails(RecallID='12345', Products=[{
        "Name": "",
        "Description": "",
        "Model": "ABC-123",
        "Type": "",
        "CategoryID": "",
        "NumberOfUnits": ""
      }])
    model_matcher = ModelMatchStrategy()
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting 100.0: {match_score}')

    watched_product = WatchedProduct(product_model='abc123')
    recall = RecallDetails(RecallID='12345', Products=[{
        "Name": "",
        "Description": "",
        "Model": "CDE-123",
        "Type": "",
        "CategoryID": "",
        "NumberOfUnits": ""
      }])
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting 0.0: {match_score}')

    watched_product = WatchedProduct(product_model='abc123')
    recall = RecallDetails(RecallID='12345', Products=[{
        "Name": "",
        "Description": "",
        "Model": "",
        "Type": "",
        "CategoryID": "",
        "NumberOfUnits": ""
      }])
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}')

    watched_product = WatchedProduct(product_model='')
    recall = RecallDetails(RecallID='12345', Products=[{
        "Name": "",
        "Description": "",
        "Model": "",
        "Type": "",
        "CategoryID": "",
        "NumberOfUnits": ""
      }])
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}')

    # test searching for model using product name
    watched_product = WatchedProduct(product_model='metrous2')
    recall = RecallDetails(RecallID='12345', Products=[{
        "Name": "METROUS1, METROUS2 and METROUS4 Compact City Strollers",
        "Description": "",
        "Model": "",
        "Type": "",
        "CategoryID": "",
        "NumberOfUnits": "About 2,800"
      }])
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting 100.0: {match_score}')

    watched_product = WatchedProduct(product_model='city')
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}')

    watched_product = WatchedProduct(product_model='metrous9')
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}')

    watched_product = WatchedProduct(product_model='metrous9')
    recall = RecallDetails(RecallID='12345', Products=[{
        "Name": "METROUS1, METROUS2 and METROUS4 Compact City Strollers",
        "Description": "",
        "Model": "METROUS2",
        "Type": "",
        "CategoryID": "",
        "NumberOfUnits": "About 2,800"
      }])
    match_score = model_matcher.match(watched_product, recall)
    print(f'Expecting 0.0: {match_score}')


    ### fuzzy match tests ###
    print('\n[FuzzyMatchStrategy]')
    fuzzy_matcher = FuzzyMatchStrategy()

    print('(Name and Brand)')
    watched_product = WatchedProduct(
        product_name='mainstays 9 drawer dresser', 
        product_brand='mainstays'
    )
    recall = RecallDetails(
        RecallID=10957, 
        Title='Walmart Reannounces Recall of Mainstays Nine-Drawer Fabric Dressers Due to Risk of Serious Injury or Death from Tip-Over and Entrapment Hazards; Walmart Distributed Recalled Dressers Post-Recall; Sold to Consumers Through Liquidators',
        Products=[
            {
                "Name": "Mainstays 9-Drawer Fabric Dressers",
                "Description": "",
                "Model": "",
                "Type": "Desks, Dressers, Chests, Bureaus, or Buffets",
                "CategoryID": "237",
                "NumberOfUnits": "About 165,250 (About 165,000 of these dressers were previously recalled in May 2026)"
            }
        ],
        Manufacturers=[
            {
                "Name": "Hop Thang Interior Wood Co. Ltd., of Vietnam",
                "CompanyID": ""
            }
        ]
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting score>=90: {match_score}\n')

    print('(Name and Brand)')
    watched_product = WatchedProduct(
        product_name='fabric dresser', 
        product_brand='mainstays'
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting 70<=score<90: {match_score}\n')

    print('(Name and Brand)')
    watched_product = WatchedProduct(
        product_name='wooden dresser', 
        product_brand='walmart'
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting score<70: {match_score}\n')

    print('(Name and Brand)')
    watched_product = WatchedProduct(
        product_name='dresser', 
        product_brand='mainstays'
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting score<70: {match_score}\n')

    print('(Name Only)')
    watched_product = WatchedProduct(
        product_name='fabric dresser'
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting score<70: {match_score}\n')

    print('(Brand Only)')
    watched_product = WatchedProduct(
        product_brand='mainstays'
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting score<70: {match_score}\n')

    print('(No Name/Brand)')
    watched_product = WatchedProduct(
        # no name, no brand
    )
    match_score = fuzzy_matcher.match(watched_product, recall)
    print(f'Expecting None: {match_score}\n')