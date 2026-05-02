import dotenv from 'dotenv'
dotenv.config()

import http from 'http'

import app from './src/app.js'

const server = http.createServer(app)

const port = process.env.PORT || 5005

server.listen(port, () => {
    console.log(`🚀 Auth Server running on port ${port}`)
})