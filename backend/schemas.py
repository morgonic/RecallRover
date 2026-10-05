# FastAPI users schemas file

import uuid
from fastapi_users import schemas

# base schema for user data
class UserRead(schemas.BaseUser[uuid.UUID]):
    pass

# schema for creating new user
class UserCreate(schemas.BaseUserCreate):
    pass

# schema for updating user data
class UserUpdate(schemas.BaseUserUpdate):
    pass