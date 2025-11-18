# Employee Task Manager - Task Management Module

## Overview

A comprehensive task management system built with Next.js, featuring role-based access, professional UI, and real-time task tracking for both administrators and employees.

## Features Implemented

### 1. Authentication & Authorization
- **Fixed Login Redirect**: Admin/Manager users redirect to `/admin/dashboard`, employees to `/employee/dashboard`
- **Role-Based Access**: Separate login pages for admin and employee users
- **Protected Routes**: Dashboard layout verifies authentication and role-based access
- **Token Management**: Secure JWT token storage and validation

### 2. Task Management
- **Create Tasks**: Full task creation with title, description, priority, status, due date, and tags
- **Edit Tasks**: Update task details with validation
- **View Tasks**: 
  - List view with search and filter functionality
  - Kanban board view for visual task organization
  - Detail view with full task information
- **Task Status**: Supports todo, in_progress, on_hold, completed, and cancelled statuses
- **Priority Levels**: Urgent, high, medium, and low priority levels

### 3. Professional UI Components
- **Task Cards**: Reusable task card component with priority and status badges
- **Activity Timeline**: Visual timeline showing task activities and updates
- **Comments System**: Add comments to tasks for team collaboration
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Dark Theme**: Professional dark theme with proper contrast and accessibility

### 4. Admin Features
- **Assign Tasks**: Assign tasks to team members
- **Task Assignments**: View and manage all task assignments
- **User Management**: Manage team members and permissions
- **Reports**: View analytics and task statistics

### 5. Employee Features
- **My Tasks**: View assigned tasks filtered by user
- **Task Progress**: Track completion status and progress
- **Notifications**: Receive updates on task changes
- **Comments**: Collaborate with team members on tasks

## File Structure

\`\`\`
app/
├── api/
│   ├── tasks/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/route.ts         # GET, PUT, DELETE
│   └── comments/
│       ├── route.ts              # POST comments
│       └── task/[taskId]/route.ts # GET task comments
├── tasks/
│   ├── page.tsx                  # Task list view with filters
│   ├── create/page.tsx           # Create task form
│   ├── kanban/page.tsx           # Kanban board view
│   └── [id]/
│       ├── page.tsx              # Task detail view
│       └── edit/page.tsx         # Edit task form
├── admin/
│   └── dashboard/page.tsx        # Admin dashboard
├── employee/
│   └── dashboard/page.tsx        # Employee dashboard
└── auth/
    ├── login/page.tsx            # General login
    ├── admin-login/page.tsx      # Admin login
    └── employee-login/page.tsx   # Employee login

components/
├── sidebar.tsx                   # Navigation sidebar
├── top-nav.tsx                   # Top navigation bar
├── task-card.tsx                 # Reusable task card component
└── task-activity-timeline.tsx   # Activity timeline component
\`\`\`

## API Endpoints

### Tasks
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/task/[taskId]` - Get task comments

## Authentication Flow

1. User selects login type (Admin/Employee)
2. Credentials are validated against backend
3. JWT token and user data stored in localStorage
4. Automatic redirect based on user role:
   - Admin → `/admin/dashboard`
   - Employee → `/employee/dashboard`
5. Protected routes check for valid token and role

## Task Lifecycle

\`\`\`
Created (todo) → In Progress → On Hold → Completed/Cancelled
         ↓
    Can be edited at any stage
    Can add comments at any stage
    Activity tracked throughout lifecycle
\`\`\`

## Filtering & Search

### Task List
- **Search**: By title or description
- **Filter by Status**: All, To Do, In Progress, On Hold, Completed, Cancelled
- **Role-based**: Employees see only assigned tasks

### Kanban Board
- **Visual Organization**: Tasks organized by status column
- **Quick Overview**: See task count and priority at a glance

## Key Components & Features

### TaskCard Component
Reusable component displaying task summary with:
- Title and description
- Priority and status badges
- Due date and overdue indicator
- Hover effects for better UX

### TaskActivityTimeline Component
Shows activity history with:
- Timeline visualization
- Activity type icons
- User and timestamp information
- Detailed activity descriptions

### Professional Styling
- Consistent color scheme (slate, blue, green, orange, red)
- Proper spacing and typography
- Smooth transitions and hover effects
- Accessible contrast ratios
- Mobile-responsive layouts

## Environment Variables

Required backend API endpoint:
\`\`\`
http://localhost:8000/api/
\`\`\`

## Security Considerations

- JWT tokens stored in localStorage (consider moving to secure cookies in production)
- Authorization headers included in all API requests
- Role-based access control on frontend (should be enforced on backend)
- Input validation on form submissions
- CORS handled via API routes

## Future Enhancements

- Task recurrence templates
- File attachments for tasks
- Task templates and bulk operations
- Advanced filtering and sorting
- Export functionality (PDF, CSV)
- Real-time collaboration features
- Push notifications
- Email notifications
- Task dependencies
- Gantt chart view
- Time tracking integration

## Testing Checklist

- [ ] Admin login redirects to admin dashboard
- [ ] Employee login redirects to employee dashboard
- [ ] Create task form validates required fields
- [ ] Task list filters by status correctly
- [ ] Search filters tasks by title/description
- [ ] Kanban board shows correct task grouping
- [ ] Task detail page displays all information
- [ ] Comments can be added to tasks
- [ ] Task status can be updated
- [ ] Edit task form pre-fills existing data
- [ ] Logout clears tokens and redirects to auth
- [ ] Employees see only their assigned tasks
- [ ] Admin can see all tasks

## Backend Integration Notes

The frontend expects the following responses from the backend:

### Create Task Response
\`\`\`json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent",
  "status": "todo|in_progress|on_hold|completed|cancelled",
  "due_date": "ISO datetime",
  "tags": ["string"],
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime"
}
\`\`\`

### Comment Response
\`\`\`json
{
  "_id": "string",
  "task_id": "string",
  "content": "string",
  "created_by": "string",
  "created_at": "ISO datetime"
}
\`\`\`

## Support

For issues or questions about the task management module, please refer to the main project documentation or contact the development team.
