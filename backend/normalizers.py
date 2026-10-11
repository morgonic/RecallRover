# normalizer functions for upc, model, and name/brand text


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
    # take out anything that's not a letter or a number
    model = ''.join(char for char in model if (char.isdigit() or char.isalpha()))

    # return none if empty
    if (model == ''):
        return None

    return model


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