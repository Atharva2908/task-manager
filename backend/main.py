from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from app.routes import leads, campaigns, lead_analytics

# Load environment variables
load_dotenv()


# Import database and routes
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, users, tasks, comments, notifications, activity_logs, reports


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting application...")
    await connect_to_mongo()
    print("✅ Connected to MongoDB")
    yield
    # Shutdown
    print("🛑 Shutting down application...")
    await close_mongo_connection()
    print("✅ Disconnected from MongoDB")


# Initialize FastAPI app
app = FastAPI(
    title=os.getenv("APP_NAME", "Employee Task Manager API"),
    description="Complete task management system with role-based access control",
    version=os.getenv("APP_VERSION", "1.0.0"),
    lifespan=lifespan
)


# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000", ).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(activity_logs.router, prefix="/api/activity-logs", tags=["Activity Logs"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(lead_analytics.router, prefix="/api/analytics", tags=["Analytics"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Employee Task Manager API",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "docs_url": "/docs",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API is running successfully"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
