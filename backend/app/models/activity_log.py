from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class ActivityLog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    action: str
    entity_type: str
    entity_id: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True

class ActivityLogResponse(ActivityLog):
    pass
