const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

// Log the MongoDB connection URI (for debugging)
logger.info('connecting to', config.MONGODB_URI)

// Connect to MongoDB using Mongoose
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

// Serve static files from the 'dist' folder (frontend build)
app.use(express.static('dist'))

// Parse incoming JSON requests and populate req.body
app.use(express.json())

// Log details of every incoming request (method, path, body)
app.use(middleware.requestLogger)

// All routes related to notes are handled by notesRouter, prefixed with /api/notes
app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// Handle requests to unknown endpoints (404 error)
app.use(middleware.unknownEndpoint)

// Centralized error handler for catching and responding to errors
app.use(middleware.errorHandler)

module.exports = app