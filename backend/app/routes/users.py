from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.user import UserResponse, UserUpdate, UserRole
from app.security import hash_password, verify_token, get_token_from_header
from app.database import get_db
from bson.objectid import ObjectId
from datetime import datetime, timezone

router = APIRouter()

# ----------------------------------------------------------
# FIX: SERIALIZER FOR OBJECTID → STRING (IMPORTANT)
# ----------------------------------------------------------
def serialize_user(user: dict):
    """Convert MongoDB ObjectId to string before returning"""
    user["_id"] = str(user["_id"])
    return user


# ----------------------------------------------------------
# AUTH HELPERS
# ----------------------------------------------------------
def get_current_user_from_header(authorization: Optional[str] = Header(None)):
    """Extract and verify current user from Authorization header"""
    token = get_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return payload


# ----------------------------------------------------------
# GET PROFILE
# ----------------------------------------------------------
@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = None, authorization: Optional[str] = Header(None)):
    """Get current authenticated user profile"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user.get("sub"))})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**serialize_user(user))


# ----------------------------------------------------------
# UPDATE PROFILE
# ----------------------------------------------------------
@router.put("/me", response_model=UserResponse)
async def update_profile(
    request: UserUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update current user profile"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    user_id = ObjectId(current_user.get("sub"))
    
    update_data = request.dict(exclude_unset=True, exclude_none=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.users.update_one({"_id": user_id}, {"$set": update_data})
    user = await db.users.find_one({"_id": user_id})
    
    return UserResponse(**serialize_user(user))


# ----------------------------------------------------------
# LIST USERS (WITH PAGINATION)
# ----------------------------------------------------------
@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 10,
    role: Optional[UserRole] = None,
    authorization: Optional[str] = Header(None)
):
    """List all users (paginated)"""
    get_current_user_from_header(authorization)
    
    db = get_db()
    query = {"is_deleted": False}
    
    if role:
        query["role"] = role.value
    
    users = await db.users.find(query).skip(skip).limit(limit).to_list(length=limit)
    return [UserResponse(**serialize_user(user)) for user in users]


# ----------------------------------------------------------
# GET USER BY ID
# ----------------------------------------------------------
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, authorization: Optional[str] = Header(None)):
    """Get user by ID"""
    get_current_user_from_header(authorization)

    db = get_db()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id), "is_deleted": False})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**serialize_user(user))


# ----------------------------------------------------------
# DELETE USER (SOFT DELETE)
# ----------------------------------------------------------
@router.delete("/{user_id}")
async def delete_user(user_id: str, authorization: Optional[str] = Header(None)):
    """Soft delete user by ID"""
    current_user = get_current_user_from_header(authorization)
    
    # Admin only
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )
    
    db = get_db()
    
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}


# ----------------------------------------------------------
# UPDATE USER ROLE (ADMIN ONLY)
# ----------------------------------------------------------
@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: UserRole,
    authorization: Optional[str] = Header(None)
):
    """Update user role (admin only)"""
    current_user = get_current_user_from_header(authorization)
    
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user roles"
        )
    
    db = get_db()
    
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": role.value, "updated_at": datetime.now(timezone.utc)}}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User role updated to {role.value}"}
