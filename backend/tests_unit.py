# unit test file for backend

import pytest
from normalizers import normalize_upc, normalize_model, normalize_text
from matching import get_match_label, UPCMatchStrategy, ModelMatchStrategy
from database import WatchedProduct
from schemas import RecallDetails



# ============================== #
### tests for helper functions ###
# ============================== #

# testing normalize_upc helper function for:
# stripping leading zeroes, letters, whitespace, returning None
@pytest.mark.parametrize('upc, expected', [
    ('000123456789', '123456789'),
    ('123abc456xyz789', '123456789'),
    (None, None),
    ('', None),
    ('    ', None),
    ('00000', None)
])
def test_normalize_upc(upc, expected):
    assert normalize_upc(upc) == expected

# testing normalize_model helper function for:
# stripping non-letter/number chars, making lowercase, returning None
@pytest.mark.parametrize('model, expected', [
    ('ABC-123!!', 'abc123'), 
    ('@# Abc  ! 123', 'abc123'), 
    ('abc  123', 'abc123'),
    (None, None),
    ('', None),
    ('    ', None)
])
def test_normalize_model(model, expected):
    assert normalize_model(model) == expected

# testing normalize_text helper function for:
# stripping possessives ('s), extra whitespace, 
# making lowercase, stripping non-letter/number chars,
# returning None
@pytest.mark.parametrize('text, expected', [
    ('GRACO\'S 2-in-1 stroller', 'graco 2 in 1 stroller'), 
    ('graco  2-in-1   stroller  ', 'graco 2 in 1 stroller'), 
    ('GRACO\'S STROLLER !!!', 'graco stroller'),
    ('', None),
    (None, None),
    ('  ', None)
])
def test_normalize_text(text, expected):
    assert normalize_text(text) == expected

# testing get_match_label helper function for returning correct label
@pytest.mark.parametrize('conf_score, label', [
    (90.0, 'Recalled'), 
    (94.34, 'Recalled'), 
    (99.9123, 'Recalled'), 
    (100.0, 'Recalled'),
    (89.999998, 'Possible Recall'),
    (70.0, 'Possible Recall'),
    (72.456, 'Possible Recall'),
    (82.789, 'Possible Recall'),
    (69.99999, 'No match'),
    (42.0, 'No match'),
    (0.0, 'No match'),
    (68.256, 'No match'),
])
def test_get_match_label(conf_score, label):
    assert get_match_label(conf_score) == label


# ============================================= #
### fixtures for WatchedProduct/RecallDetails ###
# ============================================= #

@pytest.fixture
def recall_all_values():
    recall = RecallDetails(
        RecallID=12345, 
        ProductUPCs=[
            {'UPC': '0001234567'}, 
            {'UPC': '00123456789'},
            {'UPC': '123456790'}
        ],
        Products=[{
            "Name": "",
            "Description": "",
            "Model": "ABC-123",
            "Type": "",
            "CategoryID": "",
            "NumberOfUnits": ""
        }]
    )
    return recall

@pytest.fixture
def recall_no_upc():
    recall = RecallDetails(
        RecallID=12345, 
        ProductUPCs=[],
        Products=[{
            "Name": "",
            "Description": "",
            "Model": "ABC-123",
            "Type": "",
            "CategoryID": "",
            "NumberOfUnits": ""
        }]
    )
    return recall

@pytest.fixture
def recall_no_model():
    recall = RecallDetails(
        RecallID=12345, 
        ProductUPCs=[
            {'UPC': '0001234567'}, 
            {'UPC': '00123456789'},
            {'UPC': '123456790'}
        ],
        Products=[{
            "Name": "",
            "Description": "",
            "Model": "",
            "Type": "",
            "CategoryID": "",
            "NumberOfUnits": ""
        }]
    )
    return recall

@pytest.fixture
def watched_product_all_values():
    watched_product = WatchedProduct(product_upc='0123456789', product_model='abc123')
    return watched_product

@pytest.fixture
def watched_product_no_upc():
    watched_product = WatchedProduct(product_upc=None, product_model='abc123')
    return watched_product

@pytest.fixture
def watched_product_mismatch_upc():
    watched_product = WatchedProduct(product_upc='0234567891', product_model='abc123')
    return watched_product

@pytest.fixture
def watched_product_no_model():
    watched_product = WatchedProduct(product_upc='0123456789', product_model=None)
    return watched_product

@pytest.fixture
def watched_product_mismatch_model():
    watched_product = WatchedProduct(product_upc='0123456789', product_model='cde345')
    return watched_product


# ================================= #
### matching tests using fixtures ###
# ================================= #

# testing UPCMatchStrategy.match() for returning 100.0 for exact match
def test_upcmatchstrategy_exact(watched_product_all_values, recall_all_values):
    strategy = UPCMatchStrategy()
    score = strategy.match(
        watched_product=watched_product_all_values, 
        recall=recall_all_values
    )
    assert score == 100.0

# testing UPCMatchStrategy.match() for returning 0.0 for mismatch
def test_upcmatchstrategy_mismatch(watched_product_mismatch_upc, recall_all_values):
    strategy = UPCMatchStrategy()
    score = strategy.match(
        watched_product=watched_product_mismatch_upc, 
        recall=recall_all_values
    )
    assert score == 0.0

# testing UPCMatchStrategy.match() for returning None when no upc on either side
@pytest.mark.parametrize('watched_product, recall, expected', [
    ('watched_product_no_upc', 'recall_no_upc', None),
    ('watched_product_all_values', 'recall_no_upc', None),
    ('watched_product_no_upc', 'recall_all_values', None)
])
def test_upcmatchstrategy_none(request, watched_product, recall, expected):
    strategy = UPCMatchStrategy()
    score = strategy.match(
        watched_product=request.getfixturevalue(watched_product), 
        recall=request.getfixturevalue(recall)
    )
    assert score == expected

# testing ModelMatchStrategy.match() for returning 100.0 for exact match
def test_modelmatchstrategy_exact(watched_product_all_values, recall_all_values):
    strategy = ModelMatchStrategy()
    score = strategy.match(
        watched_product=watched_product_all_values,
        recall=recall_all_values
    )
    assert score == 100.0

# testing ModelMatchStrategy.match() for returning 0.0 for mismatch
def test_modelmatchstrategy_mismatch(watched_product_mismatch_model, recall_all_values):
    strategy = ModelMatchStrategy()
    score = strategy.match(
        watched_product=watched_product_mismatch_model, 
        recall=recall_all_values
    )
    assert score == 0.0

# testing ModelMatchStrategy.match() for returning None when no model on either side
@pytest.mark.parametrize('watched_product, recall, expected', [
    ('watched_product_no_model', 'recall_no_model', None),
    ('watched_product_all_values', 'recall_no_model', None),
    ('watched_product_no_model', 'recall_all_values', None)
])
def test_modelmatchstrategy_none(request, watched_product, recall, expected):
    strategy = ModelMatchStrategy()
    score = strategy.match(
        watched_product=request.getfixturevalue(watched_product), 
        recall=request.getfixturevalue(recall)
    )
    assert score == expected