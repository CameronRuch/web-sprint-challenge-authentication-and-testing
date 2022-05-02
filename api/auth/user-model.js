const db = require('../../data/dbConfig')

function find() {
    return db('users')
  }
  
  function findByUsername(username) {
    return db('users').where("username", username)
  }
  

  async function add(user) {
    const [username] = await db('users').insert(user)
    return findByUsername(username)
  
  }

  module.exports = {
      find,
      findByUsername,
      add
  }