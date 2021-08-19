const jwt = require('jsonwebtoken')

class TokenGenerator {
  async generate (id) {
    return jwt.sign(id, 'secret')
  }
}

describe('Email Validator', () => {
  test('Should return null if JWT returns null', async () => {
    const sut = new TokenGenerator()
    jwt.token = null
    const token = await sut.generate('any_id')

    expect(token).toBe(null)
  })

  test('Should returns a token if JWT returns token', async () => {
    const sut = new TokenGenerator()
    const token = await sut.generate('any_id')

    expect(token).toBe(jwt.token)
  })
})
