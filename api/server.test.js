// Write your tests here
// test('sanity', () => {
//   expect(true).toBe(true)
// })
const db = require('../data/dbConfig')
const server = require('./server')
const bcrypt = require('bcryptjs')
const request = require('supertest')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate();
    await db('users')
        .insert([
          {
            username: 'cam',
            password: '$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq', // password "1234"
          },
          {
            username: 'andrew',
            password: '$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq', // password "1234"
          },
        ])
})

afterAll(async () => {
  await db.destroy()
})

it('[0] sanity check', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  describe('[POST] /api/auth/login', () => {
    it('body has correct message with valid credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'cam', password: '1234' })
      expect(res.body.message).toMatch(/welcome, cam/i)
    })

    it('body has correct status and message with invalid credentials', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'cameron', password: '1234' })
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
      res = await request(server).post('/api/auth/login').send({ username: 'cam', password: '12345' })
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
    })
  })

  describe('[POST] /api/auth/register', () => {
    it('creates a new user', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'lani', password: '1234' })
      const lani = await db('users').where('username', 'lani').first()
      expect(lani).toMatchObject({ username: 'lani' })
      expect(res.status).toBe(201)
    })

    it('saves the user with a hashed password', async () => {
      await request(server).post('/api/auth/register').send({ username: 'lani', password: '1234' })
      const lani = await db('users').where('username', 'lani').first()
      expect(bcrypt.compareSync('1234', lani.password)).toBeTruthy()
    })    

    it('[4.5] error if username exists', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'andrew', password: '1234' })
      expect(res.status).toBe(422)
    })

  })

  describe('[GET] /api/jokes', () => {
    it('correct message with no token', async () => {
      const res = await request(server).get('/api/jokes')
      expect(res.body.message).toMatch(/token required/i)
    })

    it('correct message with invalid token', async () => {
      const res = await request(server).get('/api/jokes').set('Authorization', 'foobar')
      expect(res.body.message).toMatch(/token invalid/i)
    })

    it('correct response with valid token', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'cam', password: '1234' })
      res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
      expect(res.body).toMatchObject([
        {
          "id": "0189hNRf2g",
          "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
        },
        {
          "id": "08EQZ8EQukb",
          "joke": "Did you hear about the guy whose whole left side was cut off? He's all right now."
        },
        {
          "id": "08xHQCdx5Ed",
          "joke": "Why didn’t the skeleton cross the road? Because he had no guts."
        },
      ])
    })
  })

})