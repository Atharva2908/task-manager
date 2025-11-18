from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.notification import NotificationResponse
from app.security import verify_token, get_token_from_header
from app.database import get_db
from bson.objectid import ObjectId

router = APIRouter()

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

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0,
    limit: int = 10,
    unread_only: bool = False,
    authorization: Optional[str] = Header(None)
):
    """Get user notifications"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    query = {"user_id": current_user.get("sub")}
    
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(query).skip(skip).limit(limit).to_list(length=limit)
    return [NotificationResponse(**n) for n in notifications]

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    authorization: Optional[str] = Header(None)
):
    """Mark notification as read"""
    get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        result = await db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"is_read": True}}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@router.put("/mark-all-read")
async def mark_all_as_read(authorization: Optional[str] = Header(None)):
    """Mark all notifications as read"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    await db.notifications.update_many(
        {"user_id": current_user.get("sub")},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "All notifications marked as read"}
