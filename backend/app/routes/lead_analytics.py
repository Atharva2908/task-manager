from fastapi import APIRouter, HTTPException, status, Header, Query
from typing import Optional
from app.security import verify_token, get_token_from_header
from app.database import get_db
from datetime import datetime, timedelta, timezone, date
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

@router.get("/leads/overview")
async def get_lead_analytics_overview(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    authorization: Optional[str] = Header(None)
):
    """Get overall lead analytics"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    # Default to last 30 days if not specified
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Total leads by status
    status_pipeline = [
        {"$match": {
            "is_deleted": False,
            "created_at": {"$gte": start_datetime, "$lte": end_datetime}
        }},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    
    status_breakdown = await db.leads.aggregate(status_pipeline).to_list(length=None)
    
    # Leads by source
    source_pipeline = [
        {"$match": {
            "is_deleted": False,
            "created_at": {"$gte": start_datetime, "$lte": end_datetime}
        }},
        {"$group": {
            "_id": "$source",
            "count": {"$sum": 1}
        }}
    ]
    
    source_breakdown = await db.leads.aggregate(source_pipeline).to_list(length=None)
    
    # Disqualification reasons
    disqualification_pipeline = [
        {"$match": {
            "is_deleted": False,
            "status": "disqualified",
            "created_at": {"$gte": start_datetime, "$lte": end_datetime}
        }},
        {"$group": {
            "_id": "$disqualification_reason",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    disqualification_reasons = await db.leads.aggregate(disqualification_pipeline).to_list(length=None)
    
    # Daily trend
    daily_pipeline = [
        {"$match": {
            "is_deleted": False,
            "created_at": {"$gte": start_datetime, "$lte": end_datetime}
        }},
        {"$group": {
            "_id": {
                "year": {"$year": "$created_at"},
                "month": {"$month": "$created_at"},
                "day": {"$dayOfMonth": "$created_at"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    daily_trend = await db.leads.aggregate(daily_pipeline).to_list(length=None)
    
    # Total counts
    total_leads = await db.leads.count_documents({
        "is_deleted": False,
        "created_at": {"$gte": start_datetime, "$lte": end_datetime}
    })
    
    return {
        "total_leads": total_leads,
        "status_breakdown": status_breakdown,
        "source_breakdown": source_breakdown,
        "disqualification_reasons": disqualification_reasons,
        "daily_trend": daily_trend,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }

@router.get("/campaigns/overview")
async def get_campaign_analytics_overview(
    authorization: Optional[str] = Header(None)
):
    """Get overall campaign analytics"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    # All active campaigns
    campaigns = await db.campaigns.find({"is_deleted": False}).to_list(length=None)
    
    campaign_stats = []
    
    for campaign in campaigns:
        campaign_id = str(campaign["_id"])
        
        # Get lead counts
        total_leads = await db.leads.count_documents({"campaign_id": campaign_id, "is_deleted": False})
        qualified_leads = await db.leads.count_documents({"campaign_id": campaign_id, "status": "qualified", "is_deleted": False})
        disqualified_leads = await db.leads.count_documents({"campaign_id": campaign_id, "status": "disqualified", "is_deleted": False})
        
        # Calculate conversion rate
        conversion_rate = (qualified_leads / total_leads * 100) if total_leads > 0 else 0
        
        # Get today's progress
        today = date.today()
        today_target = None
        for target in campaign.get("daily_targets", []):
            if target["date"] == today:
                today_target = target
                break
        
        campaign_stats.append({
            "campaign_id": campaign_id,
            "campaign_name": campaign["name"],
            "campaign_type": campaign["campaign_type"],
            "status": campaign["status"],
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "disqualified_leads": disqualified_leads,
            "conversion_rate": round(conversion_rate, 2),
            "today_target": today_target
        })
    
    return {
        "campaigns": campaign_stats,
        "total_campaigns": len(campaigns)
    }

@router.get("/team/performance")
async def get_team_performance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    authorization: Optional[str] = Header(None)
):
    """Get team member performance metrics"""
    current_user = get_current_user_from_header(authorization)
    
    # Only admin/manager can view team performance
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can view team performance"
        )
    
    db = get_db()
    
    # Default to last 30 days
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Performance by team member
    pipeline = [
        {"$match": {
            "is_deleted": False,
            "created_at": {"$gte": start_datetime, "$lte": end_datetime},
            "assigned_to": {"$exists": True, "$ne": None}
        }},
        {"$group": {
            "_id": "$assigned_to",
            "total_leads": {"$sum": 1},
            "qualified": {"$sum": {"$cond": [{"$eq": ["$status", "qualified"]}, 1, 0]}},
            "disqualified": {"$sum": {"$cond": [{"$eq": ["$status", "disqualified"]}, 1, 0]}},
            "contacted": {"$sum": {"$cond": [{"$eq": ["$status", "contacted"]}, 1, 0]}}
        }},
        {"$sort": {"total_leads": -1}}
    ]
    
    team_performance = await db.leads.aggregate(pipeline).to_list(length=None)
    
    # Enrich with user details
    for performance in team_performance:
        user_id = performance["_id"]
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                performance["user_name"] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                performance["user_email"] = user.get("email")
            else:
                performance["user_name"] = "Unknown User"
                performance["user_email"] = ""
        except:
            performance["user_name"] = "Unknown User"
            performance["user_email"] = ""
        
        # Calculate conversion rate
        performance["conversion_rate"] = round(
            (performance["qualified"] / performance["total_leads"] * 100) if performance["total_leads"] > 0 else 0,
            2
        )
    
    return {
        "team_performance": team_performance,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }

@router.get("/conversion-funnel")
async def get_conversion_funnel(
    campaign_id: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """Get conversion funnel data"""
    current_user = get_current_user_from_header(authorization)
    
    db = get_db()
    
    query = {"is_deleted": False}
    if campaign_id:
        query["campaign_id"] = campaign_id
    
    # Count leads at each stage
    new_leads = await db.leads.count_documents({**query, "status": "new"})
    contacted = await db.leads.count_documents({**query, "status": "contacted"})
    qualified = await db.leads.count_documents({**query, "status": "qualified"})
    converted = await db.leads.count_documents({**query, "status": "converted"})
    disqualified = await db.leads.count_documents({**query, "status": "disqualified"})
    
    total = new_leads + contacted + qualified + converted + disqualified
    
    return {
        "funnel": [
            {"stage": "New Leads", "count": new_leads, "percentage": round((new_leads / total * 100) if total > 0 else 0, 2)},
            {"stage": "Contacted", "count": contacted, "percentage": round((contacted / total * 100) if total > 0 else 0, 2)},
            {"stage": "Qualified", "count": qualified, "percentage": round((qualified / total * 100) if total > 0 else 0, 2)},
            {"stage": "Converted", "count": converted, "percentage": round((converted / total * 100) if total > 0 else 0, 2)},
            {"stage": "Disqualified", "count": disqualified, "percentage": round((disqualified / total * 100) if total > 0 else 0, 2)}
        ],
        "total_leads": total,
        "campaign_id": campaign_id
    }
