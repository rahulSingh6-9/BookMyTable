import dotenv from 'dotenv' 
dotenv.config()

import app from './app.js'
import http from 'http'
import { initSocket } from './config/socket.js'
import { connectDB } from './config/db.js'

const server = http.createServer(app)

const io = initSocket(server)

connectDB()

const PORT = process.env.PORT || 5001

server.listen(PORT, () => {
  console.log(`🚀 Auth Server running on port ${PORT}`)
})