# normalizer functions for upc, model, and name/brand text
import re

# function for normalizing UPCs
def normalize_upc(upc: str | None):
    # return None early if upc passe din is None
    if (upc == None):
        return None
        
    # only keep numbers
    upc = ''.join(char for char in upc if char.isdigit())
    # take out leading zeroes
    upc = upc.lstrip('0')

    # return None if the upc is empty
    if (upc == ''):
        return None

    return upc

# function for normalizing models
def normalize_model(model: str | None):
    # return None early if model passed in is None
    if (model == None):
        return None
    
    # make all lowercase
    model = model.lower()
    # take out anything that's not a letter or a number with regex
    model = re.sub(r'[^a-z0-9]', '', model)

    # return none if empty
    if (model == ''):
        return None

    return model

# function for normalizing text for product name and brand
def normalize_text(text: str | None):
    # return None early if text passed in is None
    if (text == None):
        return None
    
    # make lowercase
    text = text.lower()
    # take out 's or ’s with regex
    text = re.sub(r"\b([a-z]+)['’]s\b", r"\1", text)
    # take out anything that's not a letter or a number with regex
    text = re.sub(r'[^a-z0-9 ]', ' ', text)
    # split into tokens
    tokens = text.split()
    # join with spaces
    text = ' '.join(tokens)

    # return none if empty
    if (text == ''):
        return None

    return text


# for testing
if __name__ == '__main__':
    ### normalize_upc tests ###
    print('[Testing UPC Normalizer]')
    print(f'Expecting 123456789: {normalize_upc('0001234abc567!!@-89')}')
    print(f'Expecting None: {normalize_upc('000abc!!@-')}')
    print(f'Expecting None: {normalize_upc(None)}')
    print(f'Expecting None: {normalize_upc('')}')
    print(f'Expecting True: {(normalize_upc('012345') == normalize_upc('00012345'))}')

    ### normalize_model tests ###

    print('\n[Testing Model Normalizer]')
    print(f'Expecting abc123: {normalize_model(' ABC-123,')}')
    print(f'Expecting abc123: {normalize_model(' A-B-C 123 ')}')
    print(f'Expecting None: {normalize_model(None)}')
    print(f'Expecting None: {normalize_model('- !- -@# -')}')
    print(f'Expecting None: {normalize_model('')}')
    print(f'Expecting True: {(normalize_model(' ABC-123 ') == normalize_model(' A-B-C 123 '))}')

    ### normalize text tests ###

    print('\n[Testing Text Normalizer]')
    print(f'Expecting graco 2 in 1 stroller: {normalize_text('  GRACO 2-in-1 Stroller !!')}')
    print(f'Expecting graco: {normalize_text('Graco’s')}')
    print(f'Expecting None: {normalize_text(None)}')
    print(f'Expecting None: {normalize_text('')}')
    print(f'Expecting None: {normalize_text('- !- -@# -')}')
    print(f'Expecting True: {(normalize_text('Graco car-seat') == normalize_text(' graco\'s car seat'))}')