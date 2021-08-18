const { MissingParamError } = require('../../presentation/utils/errors')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypterSpy) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypterSpy
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }

    this.loadUserByEmailRepository.load(email)
    const user = await this.loadUserByEmailRepository.load(email)
    if (!user) {
      return null
    }
    await this.encrypter.compare(password, user.password)
    return null
  }
}
