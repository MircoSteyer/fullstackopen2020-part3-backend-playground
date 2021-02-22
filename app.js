require("express-async-errors")
const config = require("./utils/config")
const express = require("express")
const app = express()
const notesRouter = require("./controllers/notes")
const usersRouter = require("./controllers/users")
const loginRouter = require("./controllers/login")
const cors = require("cors")
const logger = require("./utils/logger")
const mongoose = require("mongoose")
const middleware = require("./utils/middleware")

logger.info("Connecting to MongoDB...")

mongoose.connect(config.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => {logger.info("Connected to MongoDB")})
    .catch(error => {logger.error("Error: ", error)})


/*app.use(express.static("build"))*/
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use("/api/notes", notesRouter)
app.use("/api/users", usersRouter)
app.use("/api/login", loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
