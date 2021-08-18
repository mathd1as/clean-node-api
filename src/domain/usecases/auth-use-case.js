const { MissingParamError } = require('../../presentation/utils/errors')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypterSpy, tokenGeneratorSpy) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypterSpy
    this.tokenGeneratorSpy = tokenGeneratorSpy
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
    const isValid = await this.encrypter.compare(password, user.password)

    if (!isValid) {
      return null
    }

    await this.tokenGeneratorSpy.generate(user.id)
  }
}
