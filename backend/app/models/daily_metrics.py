from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class DailyMetricStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    LOCKED = "locked"

class DailyMetrics(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    campaign_id: str
    date: date
    daily_calling_target: int
    daily_data_target: int
    achieved_calling_count: Optional[int] = 0
    achieved_data_count: Optional[int] = 0
    qualified_calling: int = 0
    qualified_data: int = 0
    disqualified_calling: int = 0
    disqualified_data: int = 0
    disqualification_reasons: dict = {}  # key:str reason, val:int count
    status: DailyMetricStatus = DailyMetricStatus.DRAFT
    submitted_by: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True
