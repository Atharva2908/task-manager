from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
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
    # Calling related
    NO_ANSWER = "no_answer"
    UNREACHABLE = "unreachable"
    WRONG_PERSON = "wrong_person"
    NOT_INTERESTED = "not_interested"
    ALREADY_USING_COMPETITOR = "already_using_competitor"
    NO_BUDGET = "no_budget"
    NO_AUTHORITY = "no_authority"
    DO_NOT_CALL = "do_not_call"
    LANGUAGE_BARRIER = "language_barrier"
    GATEKEEPER_BLOCK = "gatekeeper_block"
    INVALID_PHONE = "invalid_phone"
    
    # Data related
    INVALID_CONTACT = "invalid_contact"
    DUPLICATE = "duplicate"
    INCOMPLETE_DATA = "incomplete_data"
    WRONG_DEMOGRAPHIC = "wrong_demographic"
    COMPANY_SIZE_MISMATCH = "company_size_mismatch"
    GEOGRAPHIC_RESTRICTION = "geographic_restriction"
    BUDGET_NOT_ALIGNED = "budget_not_aligned"
    OUT_OF_BUSINESS = "out_of_business"

class LeadBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    source: LeadSource
    status: LeadStatus = LeadStatus.NEW
    notes: Optional[str] = None
    tags: List[str] = []

class LeadCreate(LeadBase):
    campaign_id: Optional[str] = None
    assigned_to: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    source: Optional[LeadSource] = None
    status: Optional[LeadStatus] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    assigned_to: Optional[str] = None
    campaign_id: Optional[str] = None

class Lead(LeadBase):
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
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

class LeadResponse(Lead):
    pass

class LeadQualify(BaseModel):
    notes: Optional[str] = None

class LeadDisqualify(BaseModel):
    reason: DisqualificationReason
    notes: Optional[str] = None
