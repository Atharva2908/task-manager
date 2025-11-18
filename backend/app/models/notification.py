from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    TASK_ASSIGNED = "task_assigned"
    COMMENT_ADDED = "comment_added"
    MENTION = "mention"
    STATUS_CHANGED = "status_changed"
    DEADLINE_REMINDER = "deadline_reminder"

class Notification(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    type: NotificationType
    title: str
    message: str
    related_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime
    
    class Config:
        populate_by_name = True

class NotificationResponse(Notification):
    pass
