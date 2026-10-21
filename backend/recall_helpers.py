# helper functions for recalls file

import json
from schemas import RecallDetails, RecallSummary, RecallProductDetails
from database import DailyCheckLog, async_session_maker, Recall, RecallProduct
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import datetime as dt
import asyncio

# helper for building recallsummary model
def build_recall_summary(recall_details: RecallDetails):

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

        return recall_summary

# function for building recalls + recall_products table rows with recalldetails model
def build_recall(recall_details: RecallDetails):
    recall = Recall(
        recall_id =  recall_details.RecallID,
        recall_number = recall_details.RecallNumber,
        recall_date = recall_details.RecallDate,
        last_publish_date = recall_details.LastPublishDate,
        title = recall_details.Title,
        description = recall_details.Description,
        url = recall_details.URL,
        consumer_contact = recall_details.ConsumerContact,
        product_upcs = recall_details.ProductUPCs,
        images = recall_details.Images,
        hazards = recall_details.Hazards,
        injuries = recall_details.Injuries,
        remedies = recall_details.Remedies,
        remedy_options = recall_details.RemedyOptions,
        manufacturers = recall_details.Manufacturers,
        retailers = recall_details.Retailers,
        importers = recall_details.Importers,
        distributors = recall_details.Distributors
    )

    for product in recall_details.Products:
        recall_product = RecallProduct(
            recall_id = recall_details.RecallID,
            product_name = product.Name,
            product_description = product.Description,
            product_model = product.Model,
            product_type = product.Type,
            category_id = product.CategoryID,
            num_of_units = product.NumberOfUnits
        )
        (recall.products).append(recall_product)

    return recall

# function for building RecallDetails and RecallProductDetails using Recall SQLAlchemy model
def build_recall_details(recall: Recall):
    recall_products = []
    for product in recall.products or []:
        recall_product_details = RecallProductDetails(
            Name = product.product_name,
            Description = product.product_description,
            Model = product.product_model,
            Type = product.product_type,
            CategoryID = product.category_id,
            NumberOfUnits = product.num_of_units
        )
        recall_products.append(recall_product_details)
    
    recall_details = RecallDetails(
        RecallID =  recall.recall_id,
        RecallNumber = recall.recall_number,
        RecallDate = recall.recall_date,
        LastPublishDate = recall.last_publish_date,
        Title = recall.title,
        Description = recall.description,
        URL = recall.url,
        ConsumerContact = recall.consumer_contact,
        Products = recall_products,
        ProductUPCs = recall.product_upcs,
        Images = recall.images,
        Hazards = recall.hazards,
        Injuries = recall.injuries,
        Remedies = recall.remedies,
        RemedyOptions = recall.remedy_options,
        Manufacturers = recall.manufacturers,
        Retailers = recall.retailers,
        Importers = recall.importers,
        Distributors = recall.distributors
    )

    return recall_details

# helper for looking up last check date
async def get_last_check_date(session: AsyncSession):
    # get last check date from daily
    sql_statement = select(DailyCheckLog).order_by(DailyCheckLog.id.desc())
    daily_log = await session.execute(sql_statement)
    daily_log = daily_log.scalars().first()

    if (daily_log == None):
        today = dt.date.today()
        new_date = today - dt.timedelta(days=90)
        new_date = new_date.isoformat()
        return new_date
    else:
        return daily_log.last_check_date