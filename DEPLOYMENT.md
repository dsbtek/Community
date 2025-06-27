# Community App - Deployment Guide

This guide covers deploying the Community App to various cloud platforms. The app consists of a Django REST API backend and a React TypeScript frontend.

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub repository with your code
- Environment variables configured
- Database setup (PostgreSQL recommended for production)

## 🚀 Deployment Options

### Option 1: Full-Stack Deployment (Recommended)

#### 🔥 **Railway** (Easiest Full-Stack)

Railway supports both frontend and backend in a single platform with automatic deployments.

**Backend Deployment:**

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Deploy Backend**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway new
   ```

3. **Configure Environment Variables**:
   ```env
   DEBUG=0
   SECRET_KEY=your-super-secret-key-here
   ALLOWED_HOSTS=your-backend-domain.railway.app
   DATABASE_URL=postgresql://user:password@host:port/dbname
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

4. **Create `railway.json`** in backend folder:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn community.wsgi:application --bind 0.0.0.0:$PORT",
       "healthcheckPath": "/api/",
       "healthcheckTimeout": 100
     }
   }
   ```

5. **Add PostgreSQL**: In Railway dashboard, add PostgreSQL service and connect to your app.

**Frontend Deployment:**

1. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from frontend folder
   cd frontend
   vercel
   ```

2. **Configure Environment Variables** in Vercel:
   ```env
   REACT_APP_API_URL=https://your-backend-domain.railway.app/api
   ```

---

#### 🌐 **Render** (Great for Full-Stack)

**Backend on Render:**

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Create Web Service**:
   - Connect your GitHub repository
   - Select backend folder as root directory
   - Configure build and start commands

3. **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start Command**:
   ```bash
   python manage.py migrate && python manage.py collectstatic --noinput && gunicorn community.wsgi:application
   ```

5. **Environment Variables**:
   ```env
   DEBUG=0
   SECRET_KEY=your-super-secret-key-here
   DATABASE_URL=postgresql://user:password@host:port/dbname
   PYTHON_VERSION=3.11.0
   ```

6. **Add PostgreSQL**: Create PostgreSQL database in Render and connect.

**Frontend on Render:**

1. **Create Static Site**:
   - Connect repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

2. **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

---

### Option 2: Specialized Platform Deployment

#### ⚡ **Vercel** (Frontend) + **Railway** (Backend)

**Backend on Railway** (see Railway section above)

**Frontend on Vercel:**

1. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Configure `vercel.json`**:
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/static/(.*)",
         "headers": { "cache-control": "s-maxage=31536000,immutable" },
         "dest": "/static/$1"
       },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

---

#### 🎯 **Netlify** (Frontend) + **Heroku** (Backend)

**Backend on Heroku:**

1. **Create Heroku App**:
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   
   # Add PostgreSQL
   heroku addons:create heroku-postgresql:mini
   ```

2. **Create `Procfile`** in backend root:
   ```
   web: python manage.py migrate && gunicorn community.wsgi:application --log-file -
   ```

3. **Configure Settings**:
   ```bash
   heroku config:set DEBUG=0
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set ALLOWED_HOSTS=your-app.herokuapp.com
   ```

4. **Deploy**:
   ```bash
   git subtree push --prefix=backend heroku main
   ```

**Frontend on Netlify:**

1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: `frontend`

2. **Create `_redirects`** in `frontend/public/`:
   ```
   /*    /index.html   200
   ```

3. **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-app.herokuapp.com/api
   ```

---

## 🔧 Backend Configuration Files

### `backend/requirements.txt`
```txt
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.7
python-decouple==3.8
djangorestframework-simplejwt==5.3.0
Pillow==10.1.0
django-filter==23.3
drf-yasg==1.21.7
gunicorn==21.2.0
whitenoise==6.6.0
```

### `backend/community/settings.py` Updates

Add these for production:

```python
import dj_database_url

# Production settings
if not DEBUG:
    # Database
    DATABASES = {
        'default': dj_database_url.parse(config('DATABASE_URL'))
    }
    
    # Static files
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Security
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # CORS
    CORS_ALLOWED_ORIGINS = [
        config('FRONTEND_URL', default='http://localhost:3000'),
    ]
```

### Add to `MIDDLEWARE`:
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware
]
```

---

## 🌍 Environment Variables

### Backend Environment Variables:
```env
# Required
SECRET_KEY=your-super-long-secret-key-here
DEBUG=0
DATABASE_URL=postgresql://user:password@host:port/dbname
ALLOWED_HOSTS=your-domain.com,your-backend.platform.com

# Optional
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend Environment Variables:
```env
REACT_APP_API_URL=https://your-backend.platform.com/api
```

---

## 🔍 Testing Deployment

After deployment, test these endpoints:

1. **Backend Health Check**: `https://your-backend.com/api/`
2. **API Documentation**: `https://your-backend.com/swagger/`
3. **Frontend**: `https://your-frontend.com`
4. **Authentication Flow**: Register → Login → Create Group → Create Post

---

## 🚨 Common Issues & Solutions

### CORS Issues:
```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
CORS_ALLOW_CREDENTIALS = True
```

### Static Files Not Loading:
```python
# Add to settings.py
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Database Connection Issues:
```bash
# Install database adapter
pip install psycopg2-binary  # PostgreSQL
pip install dj-database-url  # URL parsing
```

### Build Failures:
- Ensure `requirements.txt` includes all dependencies
- Check Python version compatibility
- Verify environment variables are set

---

## 📊 Recommended Platform Combinations

| Frontend | Backend | Database | Difficulty | Cost |
|----------|---------|----------|------------|------|
| Vercel | Railway | Railway PostgreSQL | Easy | Free tier |
| Netlify | Render | Render PostgreSQL | Easy | Free tier |
| Vercel | Heroku | Heroku PostgreSQL | Medium | Paid |
| Railway | Railway | Railway PostgreSQL | Easiest | Free tier |

**Best for Beginners**: Vercel (Frontend) + Railway (Backend)
**Best for Production**: Render (Full-Stack) or Railway (Full-Stack)

---

## 🔄 Continuous Deployment

All platforms support automatic deployment from GitHub:

1. **Connect Repository**: Link your GitHub repo
2. **Configure Build Settings**: Set build commands and environment variables
3. **Auto-Deploy**: Every push to main branch triggers deployment

---

## 📞 Support

If you encounter issues:
- Check platform-specific documentation
- Verify environment variables
- Check build logs for errors
- Ensure database connections are working
- Test API endpoints individually

## ✅ Pre-Deployment Checklist

### Backend Checklist:
- [ ] `requirements.txt` includes all dependencies
- [ ] `Procfile` created for Heroku
- [ ] `railway.json` created for Railway
- [ ] `runtime.txt` specifies Python version
- [ ] Environment variables configured
- [ ] Database URL set correctly
- [ ] CORS origins include frontend URL
- [ ] DEBUG=0 for production
- [ ] SECRET_KEY is secure and unique

### Frontend Checklist:
- [ ] `vercel.json` created for Vercel
- [ ] `_redirects` file in `public/` for Netlify
- [ ] Environment variables set
- [ ] API URL points to backend
- [ ] Build command works locally
- [ ] TypeScript compiles without errors

### Security Checklist:
- [ ] Strong SECRET_KEY generated
- [ ] Database passwords are secure
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS properly configured
- [ ] Environment variables not in git

## 🎯 Quick Deploy Commands

### Railway (Full-Stack):
```bash
# Backend
railway login
railway new
railway add postgresql
# Set environment variables in dashboard

# Frontend
vercel --prod
# Set REACT_APP_API_URL in Vercel dashboard
```

### Render (Full-Stack):
```bash
# Create services in Render dashboard
# Connect GitHub repository
# Set environment variables
# Deploy automatically on git push
```

### Vercel + Railway:
```bash
# Backend on Railway
railway login && railway new

# Frontend on Vercel
cd frontend && vercel --prod
```

Happy deploying! 🚀
