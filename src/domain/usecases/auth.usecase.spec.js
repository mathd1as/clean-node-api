const { MissingParamError } = require('../../presentation/utils/errors')

class AuthUseCase {
  async auth (email) {
    if (!email) {
      return MissingParamError('email')
    }
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})
