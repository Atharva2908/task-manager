from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
from typing import Optional
import asyncio

# Global database client
client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        
        # Test connection
        await client.admin.command('ping')
        print(f"✅ Successfully connected to MongoDB: {settings.DATABASE_NAME}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")

async def create_indexes():
    """Create database indexes for performance optimization"""
    try:
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.users.create_index("role")
        await db.users.create_index("is_active")
        await db.users.create_index([("created_at", -1)])
        
        # Tasks collection indexes
        await db.tasks.create_index("created_by")
        await db.tasks.create_index("assigned_to")
        await db.tasks.create_index("status")
        await db.tasks.create_index("priority")
        await db.tasks.create_index("due_date")
        await db.tasks.create_index([("status", 1), ("due_date", 1)])
        await db.tasks.create_index([("assigned_to", 1), ("status", 1)])
        await db.tasks.create_index([("created_by", 1), ("created_at", -1)])
        
        # Comments collection indexes
        await db.comments.create_index("task_id")
        await db.comments.create_index("created_by")
        await db.comments.create_index([("task_id", 1), ("created_at", -1)])
        
        # Notifications collection indexes
        await db.notifications.create_index("user_id")
        await db.notifications.create_index([("user_id", 1), ("is_read", 1)])
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        
        # Activity logs collection indexes
        await db.activity_logs.create_index("user_id")
        await db.activity_logs.create_index("entity_type")
        await db.activity_logs.create_index([("user_id", 1), ("created_at", -1)])
        
        print("✅ Database indexes created successfully")
        
    except Exception as e:
        print(f"⚠️ Error creating indexes: {str(e)}")

def get_db() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo first.")
    return db
