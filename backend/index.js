// Import the Express application with all middleware and routes configured
const app = require('./app')

// Import configuration variables (like PORT) from the config utility
const config = require('./utils/config')

// Import the logger utility for logging info and errors
const logger = require('./utils/logger')

// Start the server and listen on the configured port
// When the server starts, log a message to indicate successful startup
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})