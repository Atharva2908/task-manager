from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.EMPLOYEE
    department: Optional[str] = None  # ✅ Added for frontend
    phone: Optional[str] = None       # ✅ Added for frontend


class UserCreate(UserBase):
    password: str
    department: Optional[str] = None  # ✅ Explicitly added
    phone: Optional[str] = None       # ✅ Explicitly added


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None  # ✅ Added for frontend updates
    phone: Optional[str] = None       # ✅ Added for frontend updates
    is_active: Optional[bool] = None  # ✅ CRITICAL for bulk activate/deactivate


class User(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    is_active: bool = True
    is_deleted: bool = False
    last_login: Optional[datetime] = None      # ✅ Added for frontend
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "role": "employee",
                "department": "Engineering",
                "phone": "+91-9876543210",
                "is_active": True,
                "last_login": "2026-01-13T11:13:00Z"
            }
        }


class UserResponse(User):
    pass


class UserInDB(User):
    hashed_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
