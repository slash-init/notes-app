const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username }) //search for the user from the database by the username attached to the request
  const passwordCorrect = user === null //check password
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) { //user not found or incorrect pass
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  //If the password is correct, a token is created with the method jwt.sign. The token contains the username and the user id in a digitally signed form.
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET, {expiresIn: 60*60})

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter