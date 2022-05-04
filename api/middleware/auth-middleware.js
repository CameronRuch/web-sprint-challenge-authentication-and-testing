const User = require('../auth/user-model')


async function checkUsernameFree(req, res, next) {
  try {
    const users = await User.findByUsername(req.body.username)
    if (!users.length) {
      next()
    }
    else {
      next({ "message": "username taken", status: 422 })
    }
  } catch (err) {
    next(err)
  }
}

const checkCredentials = (req, res, next) => {
  const { username, password } = req.body
  if (!username || !password) {
    next({ status: 400, message: 'username and password required'})
  } else {
    next()
  }
}

async function checkUsernameExists(req, res, next) {
  try {
    const users = await User.findByUsername(req.body.username)
    if (!users.length) {
      next({ "message": "invalid credentials", status: 401 })
    }
    else {
      req.user = users[0]
      next()
    }
  } catch (err) {
    next(err)
  }
}


module.exports = {
  checkUsernameFree,
  checkUsernameExists,
  checkCredentials
}