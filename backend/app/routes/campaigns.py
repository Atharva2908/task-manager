from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.campaign import (
    Campaign,
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    DailyTargetUpdate,
    DailyTarget
)
from app.security import verify_token, get_token_from_header
from app.database import get_db
from bson.objectid import ObjectId
from datetime import datetime, date, timezone

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

@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    request: CampaignCreate,
    authorization: Optional[str] = Header(None)
):
    """Create new campaign"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin/manager can create campaigns
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can create campaigns"
        )
    
    db = get_db()
    campaign_data = request.dict()
    campaign_data["created_by"] = current_user.get("sub")
    campaign_data["campaign_type"] = campaign_data.get("campaign_type").value if hasattr(campaign_data.get("campaign_type"), "value") else campaign_data.get("campaign_type")
    campaign_data["status"] = campaign_data.get("status", "draft").value if hasattr(campaign_data.get("status"), "value") else campaign_data.get("status", "draft")
    campaign_data["created_at"] = datetime.now(timezone.utc)
    campaign_data["updated_at"] = datetime.now(timezone.utc)
    campaign_data["is_deleted"] = False
    campaign_data["daily_targets"] = []
    campaign_data["total_leads"] = 0
    campaign_data["qualified_leads"] = 0
    campaign_data["disqualified_leads"] = 0
    campaign_data["converted_leads"] = 0
    
    result = await db.campaigns.insert_one(campaign_data)
    campaign_data["_id"] = str(result.inserted_id)
    
    return CampaignResponse(**campaign_data)

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    campaign_type: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """List campaigns with filtering"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    query = {"is_deleted": False}
    
    if status:
        query["status"] = status
    if campaign_type:
        query["campaign_type"] = campaign_type
    
    campaigns = await db.campaigns.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
    
    return [CampaignResponse(**campaign) for campaign in campaigns]

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get campaign by ID"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id), "is_deleted": False})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID"
        )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    campaign["_id"] = str(campaign["_id"])
    return CampaignResponse(**campaign)

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    request: CampaignUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update campaign"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin/manager can update campaigns
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can update campaigns"
        )
    
    db = get_db()
    
    try:
        campaign_oid = ObjectId(campaign_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID"
        )
    
    update_data = request.dict(exclude_unset=True, exclude_none=True)
    
    # Convert enums to values
    if "campaign_type" in update_data and hasattr(update_data["campaign_type"], "value"):
        update_data["campaign_type"] = update_data["campaign_type"].value
    if "status" in update_data and hasattr(update_data["status"], "value"):
        update_data["status"] = update_data["status"].value
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.campaigns.update_one({"_id": campaign_oid}, {"$set": update_data})
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    updated_campaign = await db.campaigns.find_one({"_id": campaign_oid})
    updated_campaign["_id"] = str(updated_campaign["_id"])
    
    return CampaignResponse(**updated_campaign)

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    authorization: Optional[str] = Header(None)
):
    """Soft delete campaign"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin can delete
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete campaigns"
        )
    
    db = get_db()
    
    try:
        campaign_oid = ObjectId(campaign_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID"
        )
    
    result = await db.campaigns.update_one(
        {"_id": campaign_oid},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return {"message": "Campaign deleted successfully"}

@router.put("/{campaign_id}/targets")
async def update_daily_target(
    campaign_id: str,
    request: DailyTargetUpdate,
    authorization: Optional[str] = Header(None)
):
    """Set or update daily targets for a campaign"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin/manager can update targets
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can update targets"
        )
    
    db = get_db()
    
    try:
        campaign_oid = ObjectId(campaign_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID"
        )
    
    campaign = await db.campaigns.find_one({"_id": campaign_oid})
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    daily_targets = campaign.get("daily_targets", [])
    
    # Find existing target for the date
    target_exists = False
    for i, target in enumerate(daily_targets):
        if target["date"] == request.date:
            # Update existing target
            if request.data_target is not None:
                daily_targets[i]["data_target"] = request.data_target
            if request.calling_target is not None:
                daily_targets[i]["calling_target"] = request.calling_target
            target_exists = True
            break
    
    if not target_exists:
        # Add new target
        new_target = {
            "date": request.date,
            "data_target": request.data_target or 0,
            "calling_target": request.calling_target or 0,
            "data_achieved": 0,
            "calling_achieved": 0,
            "qualified_data": 0,
            "qualified_calling": 0,
            "disqualified_data": 0,
            "disqualified_calling": 0
        }
        daily_targets.append(new_target)
    
    await db.campaigns.update_one(
        {"_id": campaign_oid},
        {"$set": {"daily_targets": daily_targets, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Daily target updated successfully", "targets": daily_targets}

@router.get("/{campaign_id}/stats")
async def get_campaign_stats(
    campaign_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get campaign statistics and performance metrics"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        campaign_oid = ObjectId(campaign_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID"
        )
    
    campaign = await db.campaigns.find_one({"_id": campaign_oid})
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Aggregate lead statistics by status and source
    pipeline = [
        {"$match": {"campaign_id": campaign_id, "is_deleted": False}},
        {"$group": {
            "_id": {"status": "$status", "source": "$source"},
            "count": {"$sum": 1}
        }}
    ]
    
    lead_stats = await db.leads.aggregate(pipeline).to_list(length=None)
    
    # Get today's target
    today = date.today()
    today_target = None
    for target in campaign.get("daily_targets", []):
        if target["date"] == today:
            today_target = target
            break
    
    campaign["_id"] = str(campaign["_id"])
    
    return {
        "campaign": campaign,
        "lead_breakdown": lead_stats,
        "today_target": today_target,
        "total_leads": campaign.get("total_leads", 0),
        "qualified_leads": campaign.get("qualified_leads", 0),
        "disqualified_leads": campaign.get("disqualified_leads", 0),
        "converted_leads": campaign.get("converted_leads", 0),
        "conversion_rate": (campaign.get("converted_leads", 0) / campaign.get("total_leads", 1)) * 100 if campaign.get("total_leads", 0) > 0 else 0
    }

@router.get("/{campaign_id}/leads")
async def get_campaign_leads(
    campaign_id: str,
    skip: int = 0,
    limit: int = 50,
    authorization: Optional[str] = Header(None)
):
    """Get all leads for a specific campaign"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    leads = await db.leads.find(
        {"campaign_id": campaign_id, "is_deleted": False}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    for lead in leads:
        lead["_id"] = str(lead["_id"])
    
    return leads

@router.put("/{campaign_id}/achieved")
async def update_achieved_target(
    campaign_id: str,
    target_date: date,
    data_achieved: Optional[int] = None,
    calling_achieved: Optional[int] = None,
    authorization: Optional[str] = Header(None)
):
    """Update achieved targets for a specific date"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        campaign_oid = ObjectId(campaign_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID"
        )
    
    campaign = await db.campaigns.find_one({"_id": campaign_oid})
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    daily_targets = campaign.get("daily_targets", [])
    
    for i, target in enumerate(daily_targets):
        if target["date"] == target_date:
            if data_achieved is not None:
                daily_targets[i]["data_achieved"] = data_achieved
            if calling_achieved is not None:
                daily_targets[i]["calling_achieved"] = calling_achieved
            break
    
    await db.campaigns.update_one(
        {"_id": campaign_oid},
        {"$set": {"daily_targets": daily_targets, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Achieved targets updated successfully"}
