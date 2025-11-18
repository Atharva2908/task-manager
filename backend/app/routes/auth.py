from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
from app.models.user import UserCreate, UserResponse, LoginRequest, TokenResponse, UserRole
from app.security import hash_password, verify_password, create_access_token
from app.database import get_db
from bson.objectid import ObjectId

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: UserCreate):
    db = get_db()
    
    existing_email = await db.users.find_one({"email": request.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    existing_username = await db.users.find_one({"username": request.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    user_data = {
        "email": request.email,
        "username": request.username,
        "first_name": request.first_name,
        "last_name": request.last_name,
        "hashed_password": hash_password(request.password),
        "role": request.role.value,
        "is_active": True,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id

    # ✅ FIX: Convert ObjectId → str
    user_data["_id"] = str(user_data["_id"])
    
    access_token = create_access_token({"sub": user_data["_id"], "email": request.email})

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

    user = await db.users.find_one({"email": request.email, "is_deleted": False})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(request.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Convert ObjectId before using it
    user["_id"] = str(user["_id"])

    access_token = create_access_token({
        "sub": user["_id"],
        "email": user["email"],
        "role": user.get("role")
    })

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
        if not request.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        access_token = create_access_token({"sub": request.get("user_id")})
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )
