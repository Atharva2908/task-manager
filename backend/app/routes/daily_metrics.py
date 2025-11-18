from fastapi import APIRouter, HTTPException, status, Header
from typing import Optional, List
from app.models.daily_metrics import DailyMetrics, DailyMetricStatus
from app.security import get_current_user_from_header
from app.database import get_db
from bson.objectid import ObjectId
from datetime import datetime, date, timezone

router = APIRouter()

@router.post("/campaigns/{campaign_id}/daily_metrics", status_code=status.HTTP_201_CREATED)
async def create_daily_metrics(
    campaign_id: str,
    daily_calling_target: int,
    daily_data_target: int,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user_from_header(authorization)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db = get_db()
    today = date.today()

    existing = await db.daily_metrics.find_one({"campaign_id": campaign_id, "date": today})
    if existing:
        raise HTTPException(status_code=400, detail="Daily metrics already exist for today")

    doc = DailyMetrics(
        campaign_id=campaign_id,
        date=today,
        daily_calling_target=daily_calling_target,
        daily_data_target=daily_data_target,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    doc.submitted_by = None
    doc.approved_by = None
    doc.approved_at = None

    result = await db.daily_metrics.insert_one(doc.dict(by_alias=True))
    doc.id = str(result.inserted_id)

    return doc

@router.put("/campaigns/{campaign_id}/daily_metrics/submit")
async def submit_achieved_counts(
    campaign_id: str,
    date: date,
    achieved_calling_count: int,
    achieved_data_count: int,
    qualified_calling: int,
    qualified_data: int,
    disqualified_calling: int,
    disqualified_data: int,
    disqualification_reasons: dict,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user_from_header(authorization)
    if user["role"] not in ["employee", "admin", "manager"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db = get_db()
    doc = await db.daily_metrics.find_one({"campaign_id": campaign_id, "date": date})
    if not doc:
        raise HTTPException(status_code=404, detail="Daily metrics not found")

    if doc.get("status") == DailyMetricStatus.LOCKED:
        raise HTTPException(status_code=400, detail="Metrics locked, cannot submit")

    update_data = {
        "achieved_calling_count": achieved_calling_count,
        "achieved_data_count": achieved_data_count,
        "qualified_calling": qualified_calling,
        "qualified_data": qualified_data,
        "disqualified_calling": disqualified_calling,
        "disqualified_data": disqualified_data,
        "disqualification_reasons": disqualification_reasons,
        "status": DailyMetricStatus.SUBMITTED,
        "submitted_by": user["sub"],
        "updated_at": datetime.now(timezone.utc)
    }
    await db.daily_metrics.update_one({"_id": doc["_id"]}, {"$set": update_data})
    return {"message": "Metrics submitted"}

@router.put("/campaigns/{campaign_id}/daily_metrics/approve")
async def approve_daily_metrics(
    campaign_id: str,
    date: date,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user_from_header(authorization)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db = get_db()
    doc = await db.daily_metrics.find_one({"campaign_id": campaign_id, "date": date})
    if not doc:
        raise HTTPException(status_code=404, detail="Daily metrics not found")

    if doc.get("status") != DailyMetricStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Metrics not submitted yet")

    update_data = {
        "status": DailyMetricStatus.APPROVED,
        "approved_by": user["sub"],
        "approved_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db.daily_metrics.update_one({"_id": doc["_id"]}, {"$set": update_data})

    # Optional: Lock metrics for the day after approval
    # await db.daily_metrics.update_one({"_id": doc["_id"]}, {"$set": {"status": DailyMetricStatus.LOCKED}})
    return {"message": "Metrics approved"}

@router.get("/campaigns/{campaign_id}/daily_metrics")
async def get_daily_metrics(
    campaign_id: str,
    date: Optional[date] = None,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user_from_header(authorization)
    db = get_db()
    query = {"campaign_id": campaign_id}
    if date:
        query["date"] = date
    doc = await db.daily_metrics.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Metrics not found")
    return doc
