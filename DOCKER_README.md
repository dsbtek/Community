# Community App - Docker Setup

This project uses Docker Compose to orchestrate a full-stack Community App with Django backend, React frontend, and MySQL database.

## Architecture

- **Backend**: Django + Django REST Framework (Port 8000)
- **Frontend**: React + Tailwind CSS (Port 3000)
- **Database**: MySQL 8.0 (Port 3306)
- **Reverse Proxy**: Nginx (Port 80) - Optional for production-like setup

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Environment Setup
```bash
# Copy environment file for backend
cp backend/.env.example backend/.env

# Edit the .env file if needed (optional for development)
```

### 2. Build and Start Services
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 3. Initialize Database
```bash
# Run Django migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **Full App via Nginx**: http://localhost (if nginx service is enabled)

## Development Workflow

### Starting Services
```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up frontend
docker-compose up backend
docker-compose up db
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete database data)
docker-compose down -v
```

### Viewing Logs
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Running Commands

#### Backend Commands
```bash
# Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic

# Install new Python packages
docker-compose exec backend pip install package-name
# Then update requirements.txt and rebuild
```

#### Frontend Commands
```bash
# Install new npm packages
docker-compose exec frontend npm install package-name

# Run tests
docker-compose exec frontend npm test
```

#### Database Commands
```bash
# Access MySQL shell
docker-compose exec db mysql -u community_user -p community_db

# Backup database
docker-compose exec db mysqldump -u community_user -p community_db > backup.sql

# Restore database
docker-compose exec -T db mysql -u community_user -p community_db < backup.sql
```

## Project Structure

```
community/
├── docker-compose.yml          # Main orchestration file
├── backend/                    # Django backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── community/              # Django project settings
│   ├── accounts/               # User authentication app
│   ├── groups/                 # Groups management app
│   └── posts/                  # Posts management app
├── frontend/                   # React frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
├── nginx/                      # Nginx configuration
│   └── nginx.conf
└── db/                         # Database initialization
    └── init.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (get JWT tokens)
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile

### Groups (To be implemented)
- `GET /api/groups/` - List all groups
- `POST /api/groups/` - Create new group
- `GET /api/groups/{id}/` - Get group details

### Posts (To be implemented)
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create new post
- `GET /api/posts/{id}/` - Get post details

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database connection issues**
   ```bash
   # Check if database is ready
   docker-compose logs db
   # Restart database service
   docker-compose restart db
   ```

3. **Frontend not updating**
   ```bash
   # Rebuild frontend container
   docker-compose build frontend
   docker-compose up frontend
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions (Linux/Mac)
   sudo chown -R $USER:$USER .
   ```

### Rebuilding Services
```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild all services
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Clean Up
```bash
# Remove all containers, networks, and images
docker-compose down --rmi all --volumes --remove-orphans

# Remove unused Docker resources
docker system prune -a
```

## Production Considerations

1. **Environment Variables**: Use proper environment files for production
2. **Database**: Use external managed database service
3. **Static Files**: Configure proper static file serving
4. **SSL**: Add SSL certificates for HTTPS
5. **Monitoring**: Add logging and monitoring services
6. **Backup**: Implement automated backup strategies

## Next Steps

### Current Implementation Status
✅ **Completed:**
- User authentication backend (registration, login, JWT tokens)
- Complete API endpoints with Swagger documentation
- React frontend with TypeScript and full UI components
- Docker containerization with MySQL database
- API connectivity between frontend and backend
- **Django models for Groups and Posts with relationships**
- **Database persistence for groups and posts**
- **User authentication in frontend with JWT tokens**
- **Form handling for creating groups and posts**
- **Comprehensive error handling and validation**
- **Unit tests for backend models and API endpoints**

🎉 **Fully Functional:**
- Complete group management (create, join, leave)
- Post creation and interaction (like/unlike)
- User authentication flow
- TypeScript frontend with proper type safety
- Production-ready Docker configuration

### Implementation Roadmap

#### Phase 1: Backend Models and Database (Priority: High)
1. **Create Django Models**
   ```bash
   # Create models for Groups and Posts
   docker-compose exec backend python manage.py startapp groups  # if not exists
   docker-compose exec backend python manage.py startapp posts   # if not exists
   ```
   - Implement `Group` model with fields: name, description, creator, created_at
   - Implement `Post` model with fields: title, content, author, group, created_at
   - Add proper relationships (ForeignKey, ManyToMany)

2. **Database Migration**
   ```bash
   # Create and apply migrations
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```

3. **Update API Views**
   - Replace mock data in `groups/views.py` with actual database queries
   - Replace mock data in `posts/views.py` with actual database queries
   - Add proper serializers for Groups and Posts
   - Implement proper CRUD operations

#### Phase 2: Frontend Authentication (Priority: High)
1. **Authentication Context**
   - Create React context for user authentication state
   - Implement login/register forms
   - Add JWT token storage and management
   - Create protected routes for authenticated users

2. **Update Navigation**
   - Add login/logout buttons to header
   - Show different navigation based on authentication status
   - Add user profile display

#### Phase 3: Forms and User Interactions (Priority: Medium)
1. **Group Management**
   - Create group creation form (authenticated users only)
   - Add group joining functionality
   - Display user's groups vs. all groups

2. **Post Management**
   - Create post creation form within groups
   - Add post editing/deletion for post authors
   - Implement post filtering by group

3. **Public Feed**
   - Create public feed component showing all posts
   - Allow unauthenticated users to view posts
   - Add pagination for large datasets

#### Phase 4: Enhanced Features (Priority: Low)
1. **User Experience**
   - Add loading states and error handling
   - Implement proper form validation
   - Add confirmation dialogs for destructive actions

2. **Social Features**
   - Implement post likes/reactions
   - Add commenting system
   - User profiles and member lists

3. **Testing and Quality**
   - Add unit tests for Django models and views
   - Add React component tests
   - Integration tests for API endpoints

### Quick Start Guide

#### Development Environment
1. **Start the development environment:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/swagger/
   - Admin: http://localhost:8000/admin/

3. **Create a superuser (optional):**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

#### Production Environment
1. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Start production environment:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

3. **Access the application:**
   - Application: http://localhost (port 80)
   - API Documentation: http://localhost/api/swagger/

### Development Tips
- Use the Swagger UI at http://localhost:8000/swagger/ to test API endpoints
- Check Docker logs with `docker-compose logs [service-name]` for debugging
- The frontend automatically reloads on code changes
- Backend changes require container restart: `docker-compose restart backend`
