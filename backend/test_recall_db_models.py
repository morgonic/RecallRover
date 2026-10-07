from database import Recall, RecallProduct, async_session_maker
from schemas import RecallDetails
import asyncio
import json

async def test_saving_recalls():
    async with async_session_maker() as session:
        # open test sample json rresponse
        with open('./test_sample_json.json') as file:
            # convert json into list of dicts
            recalls = json.load(file)
            for recall in recalls:
                recall_details = RecallDetails.model_validate(recall)
                db_recall = Recall(
                    recall_id=recall_details.RecallID,
                    recall_number=recall_details.RecallNumber,
                    recall_date=recall_details.RecallDate,
                    last_publish_date=recall_details.LastPublishDate,
                    title=recall_details.Title,
                    description=recall_details.Description,
                    url=recall_details.URL,
                    consumer_contact=recall_details.ConsumerContact,
                    product_upcs=recall_details.ProductUPCs,
                    images=recall_details.Images,
                    hazards=recall_details.Hazards,
                    injuries=recall_details.Injuries,
                    remedies=recall_details.Remedies,
                    remedy_options=recall_details.RemedyOptions,
                    manufacturers=recall_details.Manufacturers,
                    retailers=recall_details.Retailers,
                    importers=recall_details.Importers,
                    distributors=recall_details.Distributors
                )

                list_upcs = []
                for upc in recall_details.ProductUPCs:
                    list_upcs.append(upc['UPC'])
                for product in recall_details.Products:
                    db_product = RecallProduct(
                        product_name=product.Name,
                        product_description=product.Description,
                        product_model=product.Model,
                        product_type=product.Type,
                        upcs=list_upcs,
                        category_id=product.CategoryID
                    )
                    db_recall.products.append(db_product)
                session.add(db_recall)
            
            await session.commit()

if __name__ == '__main__':  
    asyncio.run(test_saving_recalls())
