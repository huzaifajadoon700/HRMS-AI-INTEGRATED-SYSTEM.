# HRMS Vercel Deployment Guide

## Overview
This guide will help you deploy the HRMS project to your own Vercel account, replacing the current friend's deployment.

## Prerequisites
1. Vercel account
2. MongoDB Atlas account
3. Google Cloud Console account (for OAuth)
4. Stripe account
5. Git repository access

## Step-by-Step Deployment Process

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy Backend First

#### Navigate to backend directory and deploy:
```bash
cd backend
vercel
```

#### Set Environment Variables in Vercel Dashboard
After backend deployment, go to your Vercel dashboard → Project → Settings → Environment Variables

**Required Backend Environment Variables:**
```env
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
Mongo_Conn=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
FRONTEND_URL=https://your-frontend-name.vercel.app
```

### 3. Update Frontend Configuration

#### After backend is deployed, update these files with your backend URL:

**File: `frontend/vercel.json`**
Replace `YOUR_BACKEND_NAME` with your actual backend deployment name:
```json
"REACT_APP_API_URL": "https://your-backend-name.vercel.app",
"REACT_APP_API_BASE_URL": "https://your-backend-name.vercel.app/api",
```

**File: `frontend/.env.production`**
```env
REACT_APP_API_URL=https://your-backend-name.vercel.app
REACT_APP_API_BASE_URL=https://your-backend-name.vercel.app/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

**File: `frontend/src/config/api.js`**
Replace the fallback URLs with your backend name.

### 4. Deploy Frontend
```bash
cd frontend
vercel
```

### 5. Deploy Full-Stack (Alternative)
You can also deploy the entire project as one:
```bash
# From root directory
vercel
```

## Required Third-Party Service Setup

### MongoDB Atlas
1. Create account at https://cloud.mongodb.com/
2. Create a new cluster
3. Create database user
4. Get connection string
5. Whitelist Vercel IPs or use 0.0.0.0/0 for all IPs

### Google OAuth Setup
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Add authorized origins:
   - `https://your-frontend-name.vercel.app`
   - `http://localhost:3000` (for development)
6. Add authorized redirect URIs:
   - `https://your-frontend-name.vercel.app/auth/callback`

### Stripe Setup
1. Create account at https://stripe.com/
2. Get your API keys from Dashboard → Developers → API keys
3. Use test keys for development, live keys for production

## Environment Variables Reference

### Backend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `8080` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `Mongo_Conn` | Alternative MongoDB connection | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your_long_secure_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |

### Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend base URL | `https://your-backend.vercel.app` |
| `REACT_APP_API_BASE_URL` | Backend API base URL | `https://your-backend.vercel.app/api` |
| `REACT_APP_STRIPE_PUBLIC_KEY` | Stripe publishable key | `pk_test_...` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |

## Security Notes

### ✅ Changes Made for Security:
- Removed hardcoded MongoDB credentials from `backend/Models/db.js`
- Removed hardcoded API URLs from configuration files
- Updated CORS to use environment variables
- Replaced friend's service keys with placeholders

### ⚠️ Important Security Steps:
1. **Never commit real API keys to Git**
2. **Use environment variables for all secrets**
3. **Rotate all API keys after deployment**
4. **Set up proper CORS origins**
5. **Use HTTPS in production**

## Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-backend-name.vercel.app/api/health
```

### 2. Test Frontend
Visit `https://your-frontend-name.vercel.app`

### 3. Test Database Connection
Check Vercel function logs for MongoDB connection status

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Update `FRONTEND_URL` in backend environment variables
2. **Database Connection**: Check MongoDB connection string and IP whitelist
3. **OAuth Errors**: Verify Google OAuth redirect URIs
4. **Build Failures**: Check environment variables are set correctly

### Vercel Logs:
```bash
vercel logs your-project-name
```

## Post-Deployment Checklist

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] Database connection working
- [ ] Google OAuth working
- [ ] Stripe payments working (if applicable)
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Domain names updated in OAuth settings

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check browser console for frontend errors
