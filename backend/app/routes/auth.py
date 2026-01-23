from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
from app.models.user import UserCreate, UserResponse, LoginRequest, TokenResponse, UserRole
from app.security import hash_password, verify_password, create_access_token
from app.database import get_db
from bson.objectid import ObjectId
from typing import Optional

router = APIRouter()

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: UserCreate):
    db = get_db()
    
    # Check existing email
    existing_email = await db.users.find_one({"email": request.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check existing username
    existing_username = await db.users.find_one({"username": request.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user with last_login initialized
    current_time = datetime.now(timezone.utc)
    user_data = {
        "email": request.email,
        "username": request.username,
        "first_name": request.first_name,
        "last_name": request.last_name,
        "hashed_password": hash_password(request.password),
        "role": request.role.value,
        "department": getattr(request, 'department', None),
        "phone": getattr(request, 'phone', None),
        "is_active": True,
        "is_deleted": False,
        "last_login": None,  # ✅ Initialized for new users
        "created_at": current_time,
        "updated_at": current_time
    }
    
    # Insert user
    result = await db.users.insert_one(user_data)
    user_data["_id"] = str(result.inserted_id)
    
    # Generate access token
    access_token = create_access_token({"sub": user_data["_id"], "email": request.email})

    # Log signup activity
    await db.activity_logs.insert_one({
        "user_id": user_data["_id"],
        "action": "signup",
        "entity_type": "user",
        "entity_id": user_data["_id"],
        "created_at": datetime.now(timezone.utc)
    })
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    db = get_db()

    # Find user
    user = await db.users.find_one({"email": request.email, "is_deleted": False})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(request.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # ✅ UPDATE last_login timestamp ATOMICALLY with error handling
    try:
        current_time = datetime.now(timezone.utc)
        update_result = await db.users.update_one(
            {"_id": user["_id"], "is_active": True},  # Safety check
            {
                "$set": {
                    "last_login": current_time, 
                    "updated_at": current_time
                }
            }
        )
        
        # Verify update succeeded
        if update_result.modified_count == 0:
            print(f"Warning: Failed to update last_login for user {user['_id']}")
            # Don't fail login, just log warning
        
    except Exception as e:
        print(f"Last login update error for user {user.get('_id', 'unknown')}: {e}")
        # Continue with login - don't fail user experience

    # Fetch updated user data
    user = await db.users.find_one({"_id": user["_id"]})
    if user:
        user["_id"] = str(user["_id"])
        user["last_login"] = user.get("last_login")  # Ensure it's included
    else:
        user = {"_id": str(user["_id"]), "last_login": current_time}  # Fallback

    # Generate access token with role
    access_token = create_access_token({
        "sub": user["_id"],
        "email": user["email"],
        "role": user.get("role")
    })

    # Log login activity
    await db.activity_logs.insert_one({
        "user_id": user["_id"],
        "action": "login",
        "entity_type": "user",
        "entity_id": user["_id"],
        "created_at": datetime.now(timezone.utc)
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.post("/refresh-token")
async def refresh_token(request: dict):
    try:
        user_id = request.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID required"
            )
        
        # ✅ Optionally update last_login on refresh (uncomment if desired)
        # db = get_db()
        # await db.users.update_one(
        #     {"_id": ObjectId(user_id)},
        #     {"$set": {"last_login": datetime.now(timezone.utc)}}
        # )
        
        access_token = create_access_token({"sub": user_id})
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )

@router.post("/logout")
async def logout():
    """
    Client-side logout - clear frontend token
    Backend token is stateless JWT so no server cleanup needed
    """
    return {"message": "Logged out successfully"}

# Health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
