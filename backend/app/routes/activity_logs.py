from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.activity_log import ActivityLogResponse
from app.security import verify_token, get_token_from_header
from app.database import get_db

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

@router.get("", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    skip: int = 0,
    limit: int = 10,
    entity_type: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """Get activity logs"""
    get_current_user_from_header(authorization)
    
    db = get_db()
    query = {}
    
    if entity_type:
        query["entity_type"] = entity_type
    
    logs = await db.activity_logs.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    return [ActivityLogResponse(**log) for log in logs]
