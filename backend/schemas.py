# FastAPI users schemas file

import uuid
from fastapi_users import schemas
from pydantic import BaseModel

### User schemas ###

# base schema for user data
class UserRead(schemas.BaseUser[uuid.UUID]):
    pass

# schema for creating new user
class UserCreate(schemas.BaseUserCreate):
    pass

# schema for updating user data
class UserUpdate(schemas.BaseUserUpdate):
    pass

### Recall schemas ###

# schema for single product in Products list from json
class RecallProductDetails(BaseModel):
    Name: str | None = None
    Description: str | None = None
    Model: str | None = None
    Type: str | None = None
    CategoryID: str | None = None
    NumberOfUnits: str | None = None

# schema for full recall returned by CPSC Recalls API
class RecallDetails(BaseModel):
    RecallID: int
    RecallNumber: str | None = None
    RecallDate: str | None = None
    LastPublishDate: str | None = None
    Title: str | None = None
    Description: str | None = None
    URL: str | None = None
    ConsumerContact: str | None = None
    Products: list[RecallProductDetails] | None = None
    ProductUPCs: list[dict] | None = None
    Images: list[dict] | None = None
    Hazards: list[dict] | None = None
    Injuries: list[dict] | None = None
    Remedies: list[dict] | None = None
    RemedyOptions: list[dict] | None = None
    Manufacturers: list[dict] | None = None
    Retailers: list[dict] | None = None
    Importers: list[dict] | None = None
    Distributors: list[dict] | None = None

# schema for recall summary to show on search/feed/recalled watch list cards
# built from recalldetails
class RecallSummary(BaseModel):
    RecallID: int
    Title: str | None = None
    RecallDate: str | None = None
    Image: str | None = None
    ProductName: str | None = None
    Hazard: str | None = None