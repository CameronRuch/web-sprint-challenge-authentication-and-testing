const db = require('../../data/dbConfig')

function find() {
  return db('users')
}

async function findById(id) {
  return db('users').where('id', id).first()
}

function findByUsername(username) {
  return db('users').where("username", username)
}

async function add(user) {
  const [id] = await db('users').insert(user)
  return findById(id)
}

module.exports = { 
  find,
  findByUsername,
  add
}