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
    department: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    department: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None  # ✅ Perfect for bulk actions

# ✅ FIXED: Use _id directly (matches MongoDB)
class User(UserBase):
    id: str = Field(..., alias="_id")  # ✅ Use 'id' in Python, '_id' in MongoDB
    is_active: bool = True
    is_deleted: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True  # Allows both 'id' and '_id' when parsing
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "id": "507f1f77bcf86cd799439011",  # Use 'id' in your code
                "first_name": "John",
                "last_name": "Doe",
                "role": "employee",
                "department": "Engineering",
                "phone": "+91-9876543210",
                "is_active": True,
                "last_login": "2026-01-13T13:11:00Z",
                "created_at": "2026-01-13T13:11:00Z"
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
    user: UserResponse  # ✅ Will include last_login
