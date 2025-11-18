from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from bson import ObjectId

class CampaignType(str, Enum):
    CALLING = "calling"
    DATA_ENTRY = "data_entry"
    MIXED = "mixed"
    EMAIL = "email"
    SOCIAL_MEDIA = "social_media"

class CampaignStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    DRAFT = "draft"

class DailyTarget(BaseModel):
    date: date
    data_target: int = 0
    data_achieved: int = 0
    calling_target: int = 0
    calling_achieved: int = 0
    qualified_data: int = 0
    qualified_calling: int = 0
    disqualified_data: int = 0
    disqualified_calling: int = 0
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat()
        }

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    campaign_type: CampaignType
    status: CampaignStatus = CampaignStatus.DRAFT
    start_date: datetime
    end_date: Optional[datetime] = None
    assigned_team_members: List[str] = []
    budget: Optional[float] = None
    target_leads: Optional[int] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    campaign_type: Optional[CampaignType] = None
    status: Optional[CampaignStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_team_members: Optional[List[str]] = None
    budget: Optional[float] = None
    target_leads: Optional[int] = None

class Campaign(CampaignBase):
    id: Optional[str] = Field(None, alias="_id")
    daily_targets: List[DailyTarget] = []
    total_leads: int = 0
    qualified_leads: int = 0
    disqualified_leads: int = 0
    converted_leads: int = 0
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

class CampaignResponse(Campaign):
    pass

class DailyTargetUpdate(BaseModel):
    date: date
    data_target: Optional[int] = None
    calling_target: Optional[int] = None
