from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.user import UserResponse, UserUpdate, UserRole
from app.security import hash_password, verify_token, get_token_from_header
from app.database import get_db
from bson.objectid import ObjectId
from datetime import datetime, timezone

router = APIRouter()

# ----------------------------------------------------------
# ✅ FIXED SERIALIZER - Handles ALL date fields properly
# ----------------------------------------------------------
def serialize_user(user: dict):
    """Convert MongoDB ObjectId + dates to proper JSON format"""
    user["_id"] = str(user["_id"])
    
    # ✅ Format ALL date fields for frontend
    if user.get("created_at"):
        user["created_at"] = user["created_at"].isoformat()
    if user.get("updated_at"):
        user["updated_at"] = user["updated_at"].isoformat()
    if user.get("last_login"):
        user["last_login"] = user["last_login"].isoformat()
        
    return user

# ----------------------------------------------------------
# AUTH HELPERS (UNCHANGED)
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
# GET PROFILE (UNCHANGED)
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
# UPDATE PROFILE (SELF) (UNCHANGED)
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
# ✅ FIXED: LIST USERS - Returns last_login properly
# ----------------------------------------------------------
@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[UserRole] = None,
    authorization: Optional[str] = Header(None)
):
    """List all users (paginated) - FIXED last_login"""
    get_current_user_from_header(authorization)
    
    db = get_db()
    query = {"is_deleted": {"$ne": True}}
    
    if role:
        query["role"] = role.value
    
    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # ✅ serialize_user now handles last_login formatting
    return [UserResponse(**serialize_user(user)) for user in users]

# ----------------------------------------------------------
# UPDATE USER BY ID (UNCHANGED)
# ----------------------------------------------------------
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: UserUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update user by ID (admin/manager only)"""
    current_user = get_current_user_from_header(authorization)
    
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins/managers can update users"
        )
    
    db = get_db()
    
    update_data = request.dict(exclude_unset=True, exclude_none=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id), "is_deleted": {"$ne": True}},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserResponse(**serialize_user(user))

# ----------------------------------------------------------
# GET USER BY ID (UNCHANGED)
# ----------------------------------------------------------
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, authorization: Optional[str] = Header(None)):
    """Get user by ID"""
    get_current_user_from_header(authorization)

    db = get_db()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id), "is_deleted": {"$ne": True}})
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
# DELETE USER (UNCHANGED)
# ----------------------------------------------------------
@router.delete("/{user_id}")
async def delete_user(user_id: str, authorization: Optional[str] = Header(None)):
    """Soft delete user by ID"""
    current_user = get_current_user_from_header(authorization)
    
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
# UPDATE USER ROLE (UNCHANGED)
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
