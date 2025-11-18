from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.comment import CommentResponse, CommentCreate
from app.security import verify_token, get_token_from_header
from app.database import get_db
from bson.objectid import ObjectId
from datetime import datetime, timezone

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

@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    request: CommentCreate,
    authorization: Optional[str] = Header(None)
):
    """Create comment on a task"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    # Verify task exists
    try:
        task = await db.tasks.find_one({"_id": ObjectId(request.task_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    comment_data = request.dict()
    comment_data["created_by"] = current_user.get("sub")
    comment_data["created_at"] = datetime.now(timezone.utc)
    comment_data["updated_at"] = datetime.now(timezone.utc)
    comment_data["is_deleted"] = False
    
    result = await db.comments.insert_one(comment_data)
    comment_data["_id"] = result.inserted_id
    
    return CommentResponse(**comment_data)

@router.get("/task/{task_id}", response_model=List[CommentResponse])
async def get_task_comments(
    task_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get all comments for a task"""
    get_current_user_from_header(authorization)
    
    db = get_db()
    comments = await db.comments.find({"task_id": task_id, "is_deleted": False}).to_list(length=100)
    return [CommentResponse(**comment) for comment in comments]

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete comment"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        comment_oid = ObjectId(comment_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid comment ID"
        )
    
    result = await db.comments.update_one(
        {"_id": comment_oid},
        {"$set": {"is_deleted": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    return {"message": "Comment deleted successfully"}
