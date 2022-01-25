const express = require('express')
const logger = require('morgan')
const cors = require('cors')
require('dotenv').config()

const usersRouter = require("./routes/api/users");
const contactsRouter = require('./routes/api/contacts')
const app = express()
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}

app.use((req, res, next) => {
  if (isEmpty(req.body)) {
    res.status(400).json({ message: "body is empty" })
    return;
  }
  next();
})

app.use("/api/users", usersRouter);
app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message })
})

module.exports = app
