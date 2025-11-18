# Employee Task Manager - FastAPI Backend

Complete backend API for the Employee Task Manager application built with FastAPI and MongoDB.

## Features

- User Authentication with JWT tokens
- Role-based access control (Admin, Manager, Employee)
- Task management (CRUD operations)
- Comments and collaboration
- Notifications system
- Activity logging
- Async operations with Motor (async MongoDB driver)
- Comprehensive error handling
- Pagination support

## Prerequisites

- Python 3.11+
- MongoDB 4.4+
- pip

## Installation

### 1. Clone and setup

\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### 2. Configure environment variables

Create `.env` file with your settings:

\`\`\`env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=task_manager
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
\`\`\`

### 3. Start MongoDB

\`\`\`bash
# Using Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0

# Or locally if MongoDB is installed
mongod --dbpath ./data
\`\`\`

### 4. Run the server

\`\`\`bash
python main.py
\`\`\`

The API will be available at `http://localhost:8000`

## Docker Setup (Recommended)

\`\`\`bash
docker-compose up
\`\`\`

This starts both MongoDB and FastAPI server.

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Demo Credentials

### Admin Account
- Email: `admin@taskmanager.com`
- Password: `Admin@123`
- Role: Admin

### Employee Account
- Email: `employee@taskmanager.com`
- Password: `Employee@123`
- Role: Employee

### Create Demo Users

\`\`\`bash
# Use the API signup endpoint
POST /api/auth/signup
Content-Type: application/json

{
  "email": "admin@taskmanager.com",
  "username": "admin",
  "first_name": "Admin",
  "last_name": "User",
  "password": "Admin@123",
  "role": "admin"
}

{
  "email": "employee@taskmanager.com",
  "username": "employee",
  "first_name": "John",
  "last_name": "Doe",
  "password": "Employee@123",
  "role": "employee"
}
\`\`\`

## Project Structure

\`\`\`
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker image definition
├── app/
│   ├── config.py           # Configuration settings
│   ├── database.py         # MongoDB connection and indexes
│   ├── security.py         # JWT and password handling
│   ├── models/             # Pydantic models
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── comment.py
│   │   ├── notification.py
│   │   └── activity_log.py
│   └── routes/             # API endpoints
│       ├── auth.py         # Authentication
│       ├── users.py        # User management
│       ├── tasks.py        # Task management
│       ├── comments.py     # Comments
│       ├── notifications.py
│       └── activity_logs.py
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users` - List all users
- `GET /api/users/{user_id}` - Get user by ID
- `DELETE /api/users/{user_id}` - Delete user
- `PATCH /api/users/{user_id}/role` - Update user role

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `GET /api/tasks/{task_id}` - Get task details
- `PUT /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task
- `GET /api/tasks/my-tasks/{status}` - Get my tasks

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/task/{task_id}` - Get task comments
- `DELETE /api/comments/{comment_id}` - Delete comment

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{notification_id}/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

### Activity Logs
- `GET /api/activity-logs` - Get activity logs

## Development

### Running tests

\`\`\`bash
pytest
\`\`\`

### Running with reload

\`\`\`bash
uvicorn main:app --reload
\`\`\`

## Deployment

### Heroku

\`\`\`bash
heroku create app-name
git push heroku main
\`\`\`

### AWS, GCP, or other cloud providers
Use Docker image for deployment.

## License

MIT
