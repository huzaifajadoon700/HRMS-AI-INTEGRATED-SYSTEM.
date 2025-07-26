const express = require("express");
const cors = require("cors");

// Initialize express app first
const app = express();

// Error handling for the entire app
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Basic middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS Setup for Vercel - Allow your specific frontend URL
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
    /\.vercel\.app$/,
    /\.localhost$/,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Health check route (must be first)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Serverless function is running",
  });
});

// API status endpoint
app.get("/api/status", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Hotel Management System API - Serverless",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
  });
});

// Initialize database connection (with error handling)
let dbConnected = false;
let dbError = null;
let dbConnection = null;

const initializeDatabase = async () => {
  try {
    require("dotenv").config();
    console.log("✅ Environment variables loaded");
    console.log(
      "🔍 Mongo_Conn:",
      process.env.Mongo_Conn
        ? process.env.Mongo_Conn.substring(0, 50) + "..."
        : "Not found"
    );
    console.log(
      "🔍 MONGO_URI:",
      process.env.MONGO_URI
        ? process.env.MONGO_URI.substring(0, 50) + "..."
        : "Not found"
    );

    // ALWAYS try to connect - we have hardcoded connection string as fallback
    const { connectDB } = require("./Models/db");
    dbConnection = await connectDB();
    dbConnected = true;
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    dbError = error.message;
    dbConnected = false;
  }
};

// Middleware to ensure database connection before API calls
const ensureDBConnection = async (req, res, next) => {
  if (!dbConnected && (process.env.MONGO_URI || process.env.Mongo_Conn)) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Failed to connect to database:", error);
    }
  }
  next();
};

// Initialize database immediately
initializeDatabase();

// Import and register routes individually with error handling
let routesLoaded = 0;
let totalRoutes = 0;
let routeErrors = [];

// Helper function to safely load routes
function safeLoadRoute(routePath, mountPath, routeName) {
  try {
    console.log(`🔄 Loading ${routeName}...`);
    const route = require(routePath);

    if (!route) {
      throw new Error(`Route module is undefined`);
    }

    app.use(mountPath, route);
    routesLoaded++;
    console.log(`✅ ${routeName} loaded at ${mountPath}`);
    return true;
  } catch (error) {
    const errorInfo = {
      routeName,
      routePath,
      mountPath,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    routeErrors.push(errorInfo);
    console.error(`❌ ${routeName} failed: ${error.message}`);
    return false;
  }
}

// Apply database connection middleware to API routes
app.use("/api", ensureDBConnection);
app.use("/auth", ensureDBConnection);

// Load routes systematically
console.log("🔄 Loading HRMS routes...");

// Core business routes (most important)
const coreRoutes = [
  ["./Routes/AuthRouter", "/auth", "Authentication"],
  ["./Routes/menuRoutes", "/api/menus", "Menu Management"],
  ["./Routes/roomRoutes", "/api/rooms", "Room Management"],
  ["./Routes/tableRoutes", "/api/tables", "Table Management"],
  ["./Routes/orderRoutes", "/api/orders", "Order Management"],
  ["./Routes/bookingRoutes", "/api/bookings", "Room Bookings"],
  ["./Routes/ReservationRoutes", "/api/reservations", "Table Reservations"],
  ["./Routes/UserRoutes", "/api/user", "User Management"],
];

// Load core routes
coreRoutes.forEach(([path, mount, name]) => {
  safeLoadRoute(path, mount, name);
});

// Additional feature routes
const additionalRoutes = [
  ["./Routes/AdminRoutes", "/api/admin", "Admin Panel"],
  ["./Routes/feedbackRoutes", "/api/feedback", "Feedback System"],
  ["./Routes/staffRoutes", "/api/staff", "Staff Management"],
  ["./Routes/shiftroutes", "/api/shift", "Shift Management"],
  ["./Routes/paymentRoutes", "/api/payment", "Payment Processing"],
  [
    "./Routes/recommendationRoutes",
    "/api/food-recommendations",
    "Food Recommendations",
  ],
  ["./Routes/GoogleRoutes", "/auth", "Google Authentication"],
  ["./Routes/PicRoutes", "/api/files", "File Upload"],
  ["./Routes/hotelSettingsRoutes", "/api/hotel-settings", "Hotel Settings"],
];

// Load additional routes
additionalRoutes.forEach(([path, mount, name]) => {
  safeLoadRoute(path, mount, name);
});

totalRoutes = coreRoutes.length + additionalRoutes.length;
console.log(
  `📊 HRMS Routes: ${routesLoaded}/${totalRoutes} loaded successfully`
);

// Add a simple test route to verify routing works
app.get("/api/simple-test", (req, res) => {
  res.json({
    success: true,
    message: "Simple routing test successful",
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to check connection string
app.get("/api/debug/connection", (req, res) => {
  // Use environment variables for connection string
  const mongo_url = process.env.MONGO_URI || process.env.Mongo_Conn;

  res.json({
    success: true,
    debug: {
      hasMongoConn: !!process.env.Mongo_Conn,
      hasMongoUri: !!process.env.MONGO_URI,
      envMongoConn: process.env.Mongo_Conn
        ? process.env.Mongo_Conn.substring(0, 50) + "..."
        : "Not found",
      envMongoUri: process.env.MONGO_URI
        ? process.env.MONGO_URI.substring(0, 50) + "..."
        : "Not found",
      forcedConnection: mongo_url.substring(0, 50) + "...",
      clusterCheck: mongo_url.includes("cluster0.kyswp") ? "CORRECT" : "WRONG",
      environment: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
});

// Create default admin endpoint
app.post("/api/setup/admin", async (req, res) => {
  try {
    if (!dbConnected) {
      await initializeDatabase();
    }

    if (!dbConnected) {
      return res.status(500).json({
        success: false,
        error: "Database not connected",
        timestamp: new Date().toISOString(),
      });
    }

    const { createDefaultAdmin } = require("./Models/db");
    await createDefaultAdmin();

    res.json({
      success: true,
      message: "Default admin created successfully",
      credentials: {
        email: "admin@hrms.com",
        password: "admin123",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Force fresh database connection endpoint
app.get("/api/force-reconnect", async (req, res) => {
  try {
    // Reset connection state
    dbConnected = false;
    dbError = null;

    // Close existing connection
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("🔄 Closed existing MongoDB connection");
    }

    // Force fresh connection
    await initializeDatabase();

    res.json({
      success: true,
      message: "Forced database reconnection",
      database: {
        connected: dbConnected,
        error: dbError,
        readyState: mongoose.connection.readyState,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test file system access
app.get("/api/debug/filesystem", (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    const routesDir = path.join(__dirname, "Routes");
    const files = fs.readdirSync(routesDir);

    res.json({
      success: true,
      routesDirectory: routesDir,
      filesFound: files,
      testRouteExists: files.includes("testRoutes.js"),
      menuRouteExists: files.includes("menuRoutes.js"),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      __dirname,
      timestamp: new Date().toISOString(),
    });
  }
});

// System info endpoint
app.get("/api/info", async (req, res) => {
  // Try to connect if not connected
  if (!dbConnected && (process.env.MONGO_URI || process.env.Mongo_Conn)) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Failed to connect during info check:", error);
    }
  }

  res.status(200).json({
    success: true,
    system: {
      name: "HRMS Backend API",
      version: "1.0.0",
      database: {
        status: dbConnected ? "connected" : "disconnected",
        error: dbError || null,
        hasConnectionString: !!(
          process.env.MONGO_URI || process.env.Mongo_Conn
        ),
      },
      routes: {
        loaded: routesLoaded,
        total: totalRoutes,
        percentage: Math.round((routesLoaded / totalRoutes) * 100),
        working: routesLoaded > 0,
      },
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
    },
  });
});

// Route errors endpoint
app.get("/api/debug/errors", (req, res) => {
  res.status(200).json({
    success: true,
    routesLoaded,
    totalRoutes,
    errors: routeErrors,
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
  });
});

// Debug routes endpoint
app.get("/api/debug/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });

  res.json({
    success: true,
    routesLoaded: routesLoaded,
    totalRoutes: totalRoutes,
    registeredRoutes: routes,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HRMS Backend API",
    version: "1.0.0",
    endpoints: ["/api/health", "/api/status", "/api/info", "/api/test"],
  });
});

// Enhanced database test endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const mongoose = require("mongoose");

    // Try to connect if not connected
    if (!dbConnected) {
      await initializeDatabase();
    }

    const connectionState = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      success: true,
      database: {
        state: states[connectionState],
        readyState: connectionState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        connected: dbConnected,
        error: dbError,
      },
      environment: {
        hasMongoUri: !!(process.env.MONGO_URI || process.env.Mongo_Conn),
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      dbError: dbError,
      timestamp: new Date().toISOString(),
    });
  }
});

// Public menu test (no auth required)
app.get("/api/test-menus", async (req, res) => {
  try {
    // Ensure database connection
    if (!dbConnected) {
      await initializeDatabase();
    }

    if (!dbConnected) {
      return res.status(500).json({
        success: false,
        error: "Database not connected",
        dbError: dbError,
        timestamp: new Date().toISOString(),
      });
    }

    const Menu = require("./Models/Menu");
    const count = await Menu.countDocuments();
    const sample = await Menu.findOne().lean();

    res.json({
      success: true,
      database: "connected",
      menuCount: count,
      sampleMenu: sample
        ? {
            id: sample._id,
            name: sample.name,
            category: sample.category,
            price: sample.price,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      dbConnected: dbConnected,
      dbError: dbError,
      timestamp: new Date().toISOString(),
    });
  }
});

// Public rooms test (no auth required)
app.get("/api/test-rooms", async (req, res) => {
  try {
    // Ensure database connection
    if (!dbConnected) {
      await initializeDatabase();
    }

    if (!dbConnected) {
      return res.status(500).json({
        success: false,
        error: "Database not connected",
        dbError: dbError,
        timestamp: new Date().toISOString(),
      });
    }

    const Room = require("./Models/Room");
    const count = await Room.countDocuments();
    const sample = await Room.findOne().lean();

    res.json({
      success: true,
      database: "connected",
      roomCount: count,
      sampleRoom: sample
        ? {
            id: sample._id,
            roomType: sample.roomType,
            roomNumber: sample.roomNumber,
            price: sample.price,
            status: sample.status,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      dbConnected: dbConnected,
      dbError: dbError,
      timestamp: new Date().toISOString(),
    });
  }
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Unhandled error:", error);

  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV === "development";

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: isDev ? error.message : "Something went wrong",
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: error.stack }),
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      "/api/health",
      "/api/info",
      "/api/menus",
      "/api/rooms",
      "/api/orders",
      "/auth/login",
      "/auth/signup",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Export for Vercel
module.exports = app;
