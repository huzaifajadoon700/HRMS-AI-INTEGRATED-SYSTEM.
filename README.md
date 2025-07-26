# Hotel & Restaurant Management System (HRMS)

A full-stack web application for hotel and restaurant management with AI-powered recommendations.

## 🚀 Features

- **Hotel Management**: Room booking, reservations, guest management
- **Restaurant Management**: Menu management, food ordering, table reservations
- **AI Recommendations**: ML-powered food, room, and table recommendations
- **Payment Integration**: Stripe payment processing
- **Real-time Updates**: Socket.io for live order tracking
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Authentication**: JWT + Google OAuth integration

## 🛠 Tech Stack

### Frontend
- React.js 18
- Bootstrap 5
- React Router
- Axios
- Socket.io Client
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Socket.io
- JWT Authentication
- Stripe API
- ML Models (Python integration)

## 📦 Project Structure

```
├── frontend/          # React.js frontend application
├── backend/           # Node.js backend API
├── vercel.json       # Vercel deployment configuration
└── README.md
```

## 🚀 Deployment to Vercel

### Prerequisites
1. Vercel account
2. MongoDB Atlas database
3. Stripe account (for payments)
4. Google OAuth credentials

### Environment Variables

#### Backend (.env)
```env
PORT=8080
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
Mongo_Conn=your_mongodb_connection_string
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

#### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-domain.vercel.app
REACT_APP_API_BASE_URL=https://your-backend-domain.vercel.app/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Deployment Steps

1. **Clone and prepare the repository**
   ```bash
   git clone <your-repo>
   cd <your-repo>
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all required environment variables
   - Redeploy if necessary

4. **Update frontend environment variables**
   - Update `frontend/.env.production` with your actual Vercel backend URL
   - Redeploy frontend

### Important Notes

- The ML models run in mock mode on Vercel (serverless limitation)
- File uploads are handled in memory (consider cloud storage for production)
- Socket.io works with Vercel's serverless functions
- MongoDB Atlas is required (local MongoDB won't work)

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📝 API Endpoints

- `/api/auth` - Authentication
- `/api/menus` - Menu management
- `/api/orders` - Order management
- `/api/rooms` - Room management
- `/api/bookings` - Hotel bookings
- `/api/tables` - Table management
- `/api/reservations` - Table reservations
- `/api/food-recommendations` - AI recommendations
- `/api/payment` - Stripe payments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.
