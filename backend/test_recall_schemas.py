# test script to validate recall schemas using sample json from CPSC response

import json
from schemas import RecallDetails, RecallSummary

if __name__ == '__main__':
    # open test sample json rresponse
    with open('./test_sample_json.json') as file:
        # convert json into list of dicts
        recalls = json.load(file)
        # iterate through each sample recall
        for recall in recalls:
            # check against pydantic schema, convert to RecallDetails object
            recall_details = RecallDetails.model_validate(recall)
            # show id, title, # of products for testing
            print(f'\nRecallID: {recall_details.RecallID}\nTitle: {recall_details.Title}\nNumber of Products: {len(recall_details.Products)}')
            # show product names, # of units
            for i, product in enumerate(recall_details.Products):
                print(f'Product Name {i+1}: {product.Name}')
                print(f'Number of Units: {product.NumberOfUnits}')

            # build product name to be one name if only one or the first name + # more if more than one
            product_names = []
            product_name = None
            # iterate through products
            for product in recall_details.Products:
                # if there is a name then append it to empty names list
                if product.Name:
                    product_names.append(product.Name)
            # get number of product names
            num_of_names = len(product_names)
            # if there's more than one name format + # more string for short name display
            if (num_of_names > 1):
                product_name = f'{product_names[0]} + {num_of_names-1} more'
            # if it's just one then index into first/only name
            elif (num_of_names == 1):
                product_name = product_names[0]
            # otherwise just leave it as None
            else:
                product_name = None
            

            # build recall summary model using recalldetails
            recall_summary = RecallSummary(
                RecallID=recall_details.RecallID,
                Title=recall_details.Title,
                RecallDate=recall_details.RecallDate,
                Image=recall_details.Images[0]['URL'] if recall_details.Images else None,
                ProductName=product_name,
                Hazard=recall_details.Hazards[0]['Name'] if recall_details.Hazards else None
            )
            # printing summary details for testing
            print(f'\n[Recall Summary]\n{recall_summary}')
            print(f'\nSummary Product Name: {recall_summary.ProductName}')