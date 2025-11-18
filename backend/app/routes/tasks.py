from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.task import TaskResponse, TaskCreate, TaskUpdate, TaskStatus, TaskPriority
from app.security import verify_token, get_token_from_header
from app.database import get_db
from bson.objectid import ObjectId
from datetime import datetime, timezone

router = APIRouter()

# ---------------------------------------------------------------
# Helper: Extract user from JWT
# ---------------------------------------------------------------

def get_current_user_from_header(authorization: Optional[str] = Header(None)):
    token = get_token_from_header(authorization)
    if not token:
        raise HTTPException(401, "Missing or invalid authorization header")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")

    return payload

# ---------------------------------------------------------------
# Helper: Convert MongoDB ObjectId → str
# ---------------------------------------------------------------

def serialize_task(task: dict):
    """Convert MongoDB ObjectIds to strings for Pydantic"""
    task["_id"] = str(task["_id"])
    task["created_by"] = str(task["created_by"]) if "created_by" in task else None
    task["assigned_to"] = str(task["assigned_to"]) if "assigned_to" in task else None
    return task


# ---------------------------------------------------------------
# Create Task
# ---------------------------------------------------------------

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(request: TaskCreate, authorization: Optional[str] = Header(None)):
    current_user = get_current_user_from_header(authorization)
    db = get_db()

    task_data = request.dict()
    task_data["created_by"] = ObjectId(current_user.get("sub"))
    task_data["assigned_to"] = ObjectId(task_data["assigned_to"]) if task_data.get("assigned_to") else None
    task_data["status"] = task_data.get("status", TaskStatus.TODO).value
    task_data["priority"] = task_data.get("priority", TaskPriority.MEDIUM).value
    task_data["created_at"] = datetime.now(timezone.utc)
    task_data["updated_at"] = datetime.now(timezone.utc)
    task_data["is_deleted"] = False
    task_data["time_logged"] = 0

    result = await db.tasks.insert_one(task_data)
    task_data["_id"] = result.inserted_id

    # Log activity
    await db.activity_logs.insert_one({
        "user_id": current_user.get("sub"),
        "action": "create",
        "entity_type": "task",
        "entity_id": str(result.inserted_id),
        "new_value": task_data,
        "created_at": datetime.now(timezone.utc)
    })

    return TaskResponse(**serialize_task(task_data))


# ---------------------------------------------------------------
# List Tasks
# ---------------------------------------------------------------

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    get_current_user_from_header(authorization)
    db = get_db()

    query = {"is_deleted": False}

    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if assigned_to:
        query["assigned_to"] = assigned_to

    tasks = await db.tasks.find(query).skip(skip).limit(limit).to_list(length=limit)
    return [TaskResponse(**serialize_task(task)) for task in tasks]


# ---------------------------------------------------------------
# Get Task by ID
# ---------------------------------------------------------------

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, authorization: Optional[str] = Header(None)):
    get_current_user_from_header(authorization)
    db = get_db()

    try:
        oid = ObjectId(task_id)
    except:
        raise HTTPException(400, "Invalid task ID")

    task = await db.tasks.find_one({"_id": oid, "is_deleted": False})
    if not task:
        raise HTTPException(404, "Task not found")

    return TaskResponse(**serialize_task(task))


# ---------------------------------------------------------------
# Update Task
# ---------------------------------------------------------------

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, request: TaskUpdate, authorization: Optional[str] = Header(None)):
    current_user = get_current_user_from_header(authorization)
    db = get_db()

    try:
        oid = ObjectId(task_id)
    except:
        raise HTTPException(400, "Invalid task ID")

    original_task = await db.tasks.find_one({"_id": oid})
    if not original_task:
        raise HTTPException(404, "Task not found")

    update_data = request.dict(exclude_unset=True, exclude_none=True)

    # Convert Enum → string
    if "status" in update_data and isinstance(update_data["status"], TaskStatus):
        update_data["status"] = update_data["status"].value
    if "priority" in update_data and isinstance(update_data["priority"], TaskPriority):
        update_data["priority"] = update_data["priority"].value

    # Convert assigned_to to ObjectId
    if "assigned_to" in update_data:
        update_data["assigned_to"] = ObjectId(update_data["assigned_to"])

    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.tasks.update_one({"_id": oid}, {"$set": update_data})

    # Log activity
    await db.activity_logs.insert_one({
        "user_id": current_user.get("sub"),
        "action": "update",
        "entity_type": "task",
        "entity_id": task_id,
        "old_value": original_task,
        "new_value": update_data,
        "created_at": datetime.now(timezone.utc)
    })

    updated_task = await db.tasks.find_one({"_id": oid})
    return TaskResponse(**serialize_task(updated_task))


# ---------------------------------------------------------------
# Delete Task (Soft Delete)
# ---------------------------------------------------------------

@router.delete("/{task_id}")
async def delete_task(task_id: str, authorization: Optional[str] = Header(None)):
    current_user = get_current_user_from_header(authorization)
    db = get_db()

    try:
        oid = ObjectId(task_id)
    except:
        raise HTTPException(400, "Invalid task ID")

    result = await db.tasks.update_one(
        {"_id": oid},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}}
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Task not found")

    await db.activity_logs.insert_one({
        "user_id": current_user.get("sub"),
        "action": "delete",
        "entity_type": "task",
        "entity_id": task_id,
        "created_at": datetime.now(timezone.utc)
    })

    return {"message": "Task deleted successfully"}


# ---------------------------------------------------------------
# Get My Tasks
# ---------------------------------------------------------------

@router.get("/my/list", response_model=List[TaskResponse])
async def get_my_tasks(
    status: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    current_user = get_current_user_from_header(authorization)
    db = get_db()

    query = {"assigned_to": ObjectId(current_user.get("sub")), "is_deleted": False}

    if status:
        query["status"] = status

    tasks = await db.tasks.find(query).to_list(length=100)
    return [TaskResponse(**serialize_task(task)) for task in tasks]
