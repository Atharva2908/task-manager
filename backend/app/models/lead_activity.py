from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId

class ActivityType(str, Enum):
    CREATED = "created"
    UPDATED = "updated"
    STATUS_CHANGED = "status_changed"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    ASSIGNED = "assigned"
    CONTACTED = "contacted"
    EMAIL_SENT = "email_sent"
    CALL_MADE = "call_made"
    MEETING_SCHEDULED = "meeting_scheduled"
    NOTE_ADDED = "note_added"
    CONVERTED = "converted"

class LeadActivityBase(BaseModel):
    lead_id: str
    activity_type: ActivityType
    description: str
    performed_by: str
    metadata: Optional[dict] = None

class LeadActivityCreate(LeadActivityBase):
    pass

class LeadActivity(LeadActivityBase):
    id: Optional[str] = Field(None, alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

class LeadActivityResponse(LeadActivity):
    pass
