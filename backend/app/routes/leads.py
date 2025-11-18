from fastapi import APIRouter, HTTPException, status, Header, Query
from typing import List, Optional
from app.models.lead import (
    Lead,
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadStatus,
    LeadSource,
    LeadQualify,
    LeadDisqualify
)
from app.models.lead_activity import LeadActivityCreate, ActivityType
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

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    request: LeadCreate,
    authorization: Optional[str] = Header(None)
):
    """Create new lead"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    lead_data = request.dict()
    lead_data["created_by"] = current_user.get("sub")
    lead_data["status"] = lead_data.get("status", LeadStatus.NEW).value if hasattr(lead_data.get("status"), "value") else lead_data.get("status", "new")
    lead_data["source"] = lead_data.get("source").value if hasattr(lead_data.get("source"), "value") else lead_data.get("source")
    lead_data["created_at"] = datetime.now(timezone.utc)
    lead_data["updated_at"] = datetime.now(timezone.utc)
    lead_data["is_deleted"] = False
    lead_data["score"] = 0
    
    result = await db.leads.insert_one(lead_data)
    lead_data["_id"] = str(result.inserted_id)
    
    # Log activity
    activity = {
        "lead_id": str(result.inserted_id),
        "activity_type": ActivityType.CREATED.value,
        "description": f"Lead created from {lead_data['source']}",
        "performed_by": current_user.get("sub"),
        "metadata": {"source": lead_data['source']},
        "created_at": datetime.now(timezone.utc)
    }
    await db.lead_activities.insert_one(activity)
    
    # Auto-create follow-up task if assigned
    if lead_data.get("assigned_to"):
        task_data = {
            "title": f"Follow up: {lead_data['name']}",
            "description": f"Contact lead {lead_data['name']} from {lead_data['source']} source\nCompany: {lead_data.get('company', 'N/A')}\nPhone: {lead_data.get('phone', 'N/A')}\nEmail: {lead_data.get('email', 'N/A')}",
            "assigned_to": lead_data.get("assigned_to"),
            "created_by": current_user.get("sub"),
            "status": "todo",
            "priority": "medium",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_deleted": False,
            "time_logged": 0,
            "tags": ["lead-followup"],
            "lead_id": str(result.inserted_id)
        }
        await db.tasks.insert_one(task_data)
    
    # Update campaign stats if campaign_id exists
    if lead_data.get("campaign_id"):
        await update_campaign_lead_count(db, lead_data["campaign_id"], lead_data["source"])
    
    return LeadResponse(**lead_data)

@router.get("", response_model=List[LeadResponse])
async def list_leads(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    source: Optional[str] = None,
    campaign_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    search: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """List leads with filtering"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    query = {"is_deleted": False}
    
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    if campaign_id:
        query["campaign_id"] = campaign_id
    if assigned_to:
        query["assigned_to"] = assigned_to
    
    # Search by name, email, phone, or company
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}}
        ]
    
    # For employees, only show their assigned leads
    if current_user.get("role") == "employee":
        query["assigned_to"] = current_user.get("sub")
    
    leads = await db.leads.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    for lead in leads:
        lead["_id"] = str(lead["_id"])
    
    return [LeadResponse(**lead) for lead in leads]

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get lead by ID"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        lead = await db.leads.find_one({"_id": ObjectId(lead_id), "is_deleted": False})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID"
        )
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Check if employee can access this lead
    if current_user.get("role") == "employee" and lead.get("assigned_to") != current_user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this lead"
        )
    
    lead["_id"] = str(lead["_id"])
    return LeadResponse(**lead)

@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    request: LeadUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update lead"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    try:
        lead_oid = ObjectId(lead_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID"
        )
    
    # Get original lead
    original_lead = await db.leads.find_one({"_id": lead_oid})
    if not original_lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    update_data = request.dict(exclude_unset=True, exclude_none=True)
    
    # Convert enums to values
    if "status" in update_data and hasattr(update_data["status"], "value"):
        update_data["status"] = update_data["status"].value
    if "source" in update_data and hasattr(update_data["source"], "value"):
        update_data["source"] = update_data["source"].value
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.leads.update_one({"_id": lead_oid}, {"$set": update_data})
    
    # Log activity
    activity = {
        "lead_id": lead_id,
        "activity_type": ActivityType.UPDATED.value,
        "description": "Lead information updated",
        "performed_by": current_user.get("sub"),
        "metadata": {"updated_fields": list(update_data.keys())},
        "created_at": datetime.now(timezone.utc)
    }
    await db.lead_activities.insert_one(activity)
    
    updated_lead = await db.leads.find_one({"_id": lead_oid})
    updated_lead["_id"] = str(updated_lead["_id"])
    
    return LeadResponse(**updated_lead)

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    authorization: Optional[str] = Header(None)
):
    """Soft delete lead"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin/manager can delete
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can delete leads"
        )
    
    db = get_db()
    
    try:
        lead_oid = ObjectId(lead_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID"
        )
    
    result = await db.leads.update_one(
        {"_id": lead_oid},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return {"message": "Lead deleted successfully"}

@router.put("/{lead_id}/qualify")
async def qualify_lead(
    lead_id: str,
    request: LeadQualify,
    authorization: Optional[str] = Header(None)
):
    """Mark lead as qualified"""
    current_user = get_current_user_from_header(authorization)
    db = get_db()
    
    try:
        lead_oid = ObjectId(lead_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID"
        )
    
    lead = await db.leads.find_one({"_id": lead_oid})
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    update_data = {
        "status": LeadStatus.QUALIFIED.value,
        "updated_at": datetime.now(timezone.utc),
        "last_contacted_at": datetime.now(timezone.utc)
    }
    
    if request.notes:
        update_data["notes"] = lead.get("notes", "") + f"\n[Qualified] {request.notes}"
    
    await db.leads.update_one({"_id": lead_oid}, {"$set": update_data})
    
    # Log activity
    activity = {
        "lead_id": lead_id,
        "activity_type": ActivityType.QUALIFIED.value,
        "description": f"Lead qualified{': ' + request.notes if request.notes else ''}",
        "performed_by": current_user.get("sub"),
        "metadata": {"notes": request.notes},
        "created_at": datetime.now(timezone.utc)
    }
    await db.lead_activities.insert_one(activity)
    
    # Update campaign stats
    if lead.get("campaign_id"):
        await update_campaign_qualified_count(db, lead["campaign_id"], lead["source"])
    
    return {"message": "Lead qualified successfully"}

@router.put("/{lead_id}/disqualify")
async def disqualify_lead(
    lead_id: str,
    request: LeadDisqualify,
    authorization: Optional[str] = Header(None)
):
    """Mark lead as disqualified with reason"""
    current_user = get_current_user_from_header(authorization)
    db = get_db()
    
    try:
        lead_oid = ObjectId(lead_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID"
        )
    
    lead = await db.leads.find_one({"_id": lead_oid})
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    update_data = {
        "status": LeadStatus.DISQUALIFIED.value,
        "disqualification_reason": request.reason.value,
        "disqualification_notes": request.notes,
        "updated_at": datetime.now(timezone.utc),
        "last_contacted_at": datetime.now(timezone.utc)
    }
    
    await db.leads.update_one({"_id": lead_oid}, {"$set": update_data})
    
    # Log activity
    activity = {
        "lead_id": lead_id,
        "activity_type": ActivityType.DISQUALIFIED.value,
        "description": f"Lead disqualified: {request.reason.value}",
        "performed_by": current_user.get("sub"),
        "metadata": {"reason": request.reason.value, "notes": request.notes},
        "created_at": datetime.now(timezone.utc)
    }
    await db.lead_activities.insert_one(activity)
    
    # Update campaign stats
    if lead.get("campaign_id"):
        await update_campaign_disqualified_count(db, lead["campaign_id"], lead["source"])
    
    return {"message": "Lead disqualified successfully"}

@router.get("/{lead_id}/activities")
async def get_lead_activities(
    lead_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get all activities for a lead"""
    current_user = get_current_user_from_header(authorization)
    db = get_db()
    
    activities = await db.lead_activities.find({"lead_id": lead_id}).sort("created_at", -1).to_list(length=100)
    
    for activity in activities:
        activity["_id"] = str(activity["_id"])
    
    return activities

@router.post("/bulk")
async def bulk_import_leads(
    leads: List[LeadCreate],
    authorization: Optional[str] = Header(None)
):
    """Bulk import leads"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin/manager can bulk import
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can bulk import leads"
        )
    
    db = get_db()
    created_leads = []
    
    for lead_data in leads:
        lead_dict = lead_data.dict()
        lead_dict["created_by"] = current_user.get("sub")
        lead_dict["status"] = lead_dict.get("status", LeadStatus.NEW).value if hasattr(lead_dict.get("status"), "value") else lead_dict.get("status", "new")
        lead_dict["source"] = lead_dict.get("source").value if hasattr(lead_dict.get("source"), "value") else lead_dict.get("source")
        lead_dict["created_at"] = datetime.now(timezone.utc)
        lead_dict["updated_at"] = datetime.now(timezone.utc)
        lead_dict["is_deleted"] = False
        lead_dict["score"] = 0
        
        result = await db.leads.insert_one(lead_dict)
        lead_dict["_id"] = str(result.inserted_id)
        created_leads.append(lead_dict)
        
        # Update campaign stats if campaign_id exists
        if lead_dict.get("campaign_id"):
            await update_campaign_lead_count(db, lead_dict["campaign_id"], lead_dict["source"])
    
    return {"message": f"{len(created_leads)} leads imported successfully", "leads": created_leads}

# Helper functions
async def update_campaign_lead_count(db, campaign_id: str, source: str):
    """Increment campaign lead count"""
    try:
        await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$inc": {"total_leads": 1}}
        )
    except:
        pass

async def update_campaign_qualified_count(db, campaign_id: str, source: str):
    """Increment campaign qualified count"""
    try:
        from datetime import date
        today = date.today()
        
        await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$inc": {"qualified_leads": 1}}
        )
        
        # Update daily target
        if source == "data_entry":
            await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id), "daily_targets.date": today},
                {"$inc": {"daily_targets.$.qualified_data": 1}}
            )
        elif source == "calling":
            await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id), "daily_targets.date": today},
                {"$inc": {"daily_targets.$.qualified_calling": 1}}
            )
    except:
        pass

async def update_campaign_disqualified_count(db, campaign_id: str, source: str):
    """Increment campaign disqualified count"""
    try:
        from datetime import date
        today = date.today()
        
        await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$inc": {"disqualified_leads": 1}}
        )
        
        # Update daily target
        if source == "data_entry":
            await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id), "daily_targets.date": today},
                {"$inc": {"daily_targets.$.disqualified_data": 1}}
            )
        elif source == "calling":
            await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id), "daily_targets.date": today},
                {"$inc": {"daily_targets.$.disqualified_calling": 1}}
            )
    except:
        pass
