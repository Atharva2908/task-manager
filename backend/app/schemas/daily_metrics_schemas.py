from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, date
from enum import Enum

class DailyMetricStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    LOCKED = "locked"  # Optional locking after approval

class DailyMetricsBaseSchema(BaseModel):
    campaign_id: str
    date: date
    daily_calling_target: int
    daily_data_target: int

class DailyMetricsCreateSchema(DailyMetricsBaseSchema):
    pass

class DailyMetricsUpdateSchema(BaseModel):
    achieved_calling_count: Optional[int]
    achieved_data_count: Optional[int]
    qualified_calling: Optional[int]
    qualified_data: Optional[int]
    disqualified_calling: Optional[int]
    disqualified_data: Optional[int]
    disqualification_reasons: Optional[Dict[str, int]]  # Reason -> Count mapping
    status: Optional[DailyMetricStatus]
    submitted_by: Optional[str]
    approved_by: Optional[str]
    approved_at: Optional[datetime]

class DailyMetricsResponseSchema(DailyMetricsBaseSchema):
    id: Optional[str] = Field(None, alias="_id")
    achieved_calling_count: Optional[int]
    achieved_data_count: Optional[int]
    qualified_calling: Optional[int]
    qualified_data: Optional[int]
    disqualified_calling: Optional[int]
    disqualified_data: Optional[int]
    disqualification_reasons: Optional[Dict[str, int]]
    status: DailyMetricStatus
    submitted_by: Optional[str]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
