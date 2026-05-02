import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

// Routes imports
import authRoutes from './modules/auth/auth.routes.js'

import tableRoutes from './modules/tables/table.routes.js'
import layoutRoutes from './modules/layouts/layout.routes.js'
import bookingRoutes from './modules/bookings/booking.routes.js'
import tableLockRoutes from "./modules/table-locks/tableLock.routes.js"
import availabilityRoutes from "./modules/availability/availability.routes.js";


const app = express()

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:3000",
  "http://192.168.153.1:8080",
  "http://192.168.153.1:8081",
  "http://192.168.73.1:8080",
  "http://192.168.73.1:8081",
  "http://10.14.72.44:8080",
  "http://10.14.72.44:8081"
]

app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
}))

app.use('/auth', authRoutes)

app.use('/api/tables', tableRoutes)
app.use('/api/layouts', layoutRoutes)
app.use('/api/bookings', bookingRoutes)
app.use("/api/table-locks", tableLockRoutes)
app.use("/api/availability", availabilityRoutes)

// 🔥 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// 🔥 Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

export default app



