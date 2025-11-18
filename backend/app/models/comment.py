from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    task_id: str

class Comment(CommentBase):
    id: Optional[str] = Field(None, alias="_id")
    task_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
    
    class Config:
        populate_by_name = True

class CommentResponse(Comment):
    pass
