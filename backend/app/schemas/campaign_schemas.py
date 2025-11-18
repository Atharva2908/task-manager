from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

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

class DailyTargetSchema(BaseModel):
    date: date
    data_target: int = 0
    data_achieved: int = 0
    calling_target: int = 0
    calling_achieved: int = 0
    qualified_data: int = 0
    qualified_calling: int = 0
    disqualified_data: int = 0
    disqualified_calling: int = 0

class CampaignBaseSchema(BaseModel):
    name: str
    description: Optional[str] = None
    campaign_type: CampaignType
    status: CampaignStatus = CampaignStatus.DRAFT
    start_date: datetime
    end_date: Optional[datetime] = None
    assigned_team_members: List[str] = []
    budget: Optional[float] = None
    target_leads: Optional[int] = None

class CampaignCreateSchema(CampaignBaseSchema):
    pass

class CampaignUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    campaign_type: Optional[CampaignType] = None
    status: Optional[CampaignStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_team_members: Optional[List[str]] = None
    budget: Optional[float] = None
    target_leads: Optional[int] = None

class CampaignResponseSchema(CampaignBaseSchema):
    id: Optional[str] = Field(None, alias="_id")
    daily_targets: List[DailyTargetSchema] = []
    total_leads: int = 0
    qualified_leads: int = 0
    disqualified_leads: int = 0
    converted_leads: int = 0
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False

class DailyTargetUpdateSchema(BaseModel):
    date: date
    data_target: Optional[int] = None
    calling_target: Optional[int] = None
