const { MissingParamError, InvalidParamError } = require('../../presentation/utils/errors')

module.exports = class AuthUseCase {
  constructor (LoadUserByEmailRepository) {
    this.LoadUserByEmailRepository = LoadUserByEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    if (!this.LoadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository')
    }
    if (!this.LoadUserByEmailRepository.load) {
      throw new InvalidParamError('loadUserByEmailRepository')
    }
    this.LoadUserByEmailRepository.load(email)

    const user = await this.LoadUserByEmailRepository.load(email)
    if (!user) {
      return null
    }
  }
}
