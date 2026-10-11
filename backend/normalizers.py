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



# for testing
if __name__ == '__main__':
    print('[Testing UPC Normalizer]')
    print(f'Expecting 123456789: {normalize_upc('0001234abc567!!@-89')}')
    print(f'Expecting None: {normalize_upc('000abc!!@-')}')
    print(f'Expecting None: {normalize_upc(None)}')
    print(f'Expecting None: {normalize_upc('')}')
    print(f'Expecting True: {(normalize_upc('012345') == normalize_upc('00012345'))}')