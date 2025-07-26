# HRMS Vercel Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Issues Fixed
- [x] Hardcoded localhost URLs replaced with environment variables
- [x] API configuration centralized in `frontend/src/config/api.js`
- [x] Serverless function optimized for Vercel
- [x] CORS configuration updated for production
- [x] Build scripts configured for Windows/Linux compatibility
- [x] Missing favicon and manifest issues resolved
- [x] Socket.io configured for serverless environment
- [x] ML models adapted for serverless limitations
- [x] Error handling and health check endpoints added
- [x] Environment variable structure standardized

### 📋 Deployment Steps

#### 1. Environment Setup

**Backend Environment Variables (Vercel Dashboard):**
```env
NODE_ENV=production
PORT=8080
Mongo_Conn=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

**Frontend Environment Variables:**
Update `frontend/.env.production` with your actual Vercel backend URL:
```env
REACT_APP_API_URL=https://your-backend-domain.vercel.app
REACT_APP_API_BASE_URL=https://your-backend-domain.vercel.app/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

#### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: GitHub Integration**
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

#### 3. Post-Deployment Configuration

1. **Update Google OAuth Settings:**
   - Add your Vercel domain to authorized origins
   - Update redirect URIs

2. **Update Stripe Webhook URLs:**
   - Configure webhook endpoints with your Vercel domain

3. **Test API Endpoints:**
   - Health check: `https://your-domain.vercel.app/api/health`
   - Status: `https://your-domain.vercel.app/api/status`

### 🔧 Known Limitations on Vercel

1. **ML Models:** Python-based recommendation services run in mock mode
2. **File Uploads:** Files are stored in memory (consider cloud storage)
3. **Socket.io:** Limited to serverless function duration
4. **Database:** Requires MongoDB Atlas (local MongoDB won't work)

### 🐛 Troubleshooting

#### Build Errors
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Verify API endpoints are accessible

#### Runtime Errors
- Check Vercel function logs
- Verify database connection
- Test API endpoints individually

#### CORS Issues
- Ensure frontend domain is in CORS whitelist
- Check API base URLs in frontend config

### 📊 Performance Optimization

1. **Frontend:**
   - Code splitting implemented
   - Image optimization recommended
   - Bundle size warnings addressed

2. **Backend:**
   - Serverless function optimized
   - Database queries optimized
   - Error handling improved

### 🔒 Security Considerations

- Environment variables properly configured
- JWT secrets are secure
- CORS properly configured
- Rate limiting implemented
- Input validation in place

### 📈 Monitoring

- Health check endpoints available
- Error logging implemented
- Performance monitoring recommended

## 🎯 Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure custom domain (optional)
3. Set up CI/CD pipeline
4. Implement proper logging
5. Add performance monitoring
6. Set up backup strategies

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints
4. Check database connectivity
5. Review CORS configuration

---

**Note:** This deployment configuration is optimized for Vercel's serverless environment. Some features may work differently than in a traditional server environment.
