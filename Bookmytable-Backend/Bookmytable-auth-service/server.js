import dotenv from 'dotenv' 
dotenv.config()

import app from './src/app.js'
import http from 'http'
import { initSocket } from './src/config/socket.js'
import { connectDB } from './src/config/db.js'
import { initKafka } from './src/kafka/index.js'
import { env } from './src/config/env.js'

const server = http.createServer(app)

const io = initSocket(server)

connectDB()
initKafka()

const PORT = env.PORT || 5001


server.listen(PORT, () => {
  console.log(`🚀 Auth Server running on port ${PORT}`)
})