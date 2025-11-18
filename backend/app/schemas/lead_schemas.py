from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    CONVERTED = "converted"

class LeadSource(str, Enum):
    CALLING = "calling"
    DATA_ENTRY = "data_entry"
    WEBSITE = "website"
    REFERRAL = "referral"
    SOCIAL_MEDIA = "social_media"
    EMAIL_CAMPAIGN = "email_campaign"
    EVENT = "event"
    OTHER = "other"

class DisqualificationReason(str, Enum):
    # Calling reasons
    NO_ANSWER = "no_answer"
    NOT_INTERESTED = "not_interested"
    ALREADY_USING_COMPETITOR = "already_using_competitor"
    NO_BUDGET = "no_budget"
    DO_NOT_CALL = "do_not_call"
    INVALID_PHONE = "invalid_phone"
    # Data entry reasons
    INVALID_CONTACT = "invalid_contact"
    DUPLICATE = "duplicate"
    INCOMPLETE_DATA = "incomplete_data"
    WRONG_DEMOGRAPHIC = "wrong_demographic"
    OUT_OF_BUSINESS = "out_of_business"

class LeadBaseSchema(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: LeadSource
    status: LeadStatus = LeadStatus.NEW
    notes: Optional[str] = None
    tags: List[str] = []

class LeadCreateSchema(LeadBaseSchema):
    campaign_id: Optional[str] = None
    assigned_to: Optional[str] = None

class LeadUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[LeadSource] = None
    status: Optional[LeadStatus] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    assigned_to: Optional[str] = None
    campaign_id: Optional[str] = None

class LeadResponseSchema(LeadBaseSchema):
    id: Optional[str] = Field(None, alias="_id")
    created_by: str
    assigned_to: Optional[str] = None
    campaign_id: Optional[str] = None
    score: int = 0
    disqualification_reason: Optional[DisqualificationReason] = None
    disqualification_notes: Optional[str] = None
    last_contacted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False

class LeadQualifySchema(BaseModel):
    notes: Optional[str] = None

class LeadDisqualifySchema(BaseModel):
    reason: DisqualificationReason
    notes: Optional[str] = None
