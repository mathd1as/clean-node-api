const { MissingParamError } = require('../../presentation/utils/errors')

module.exports = class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    if (!email) {
      throw new MissingParamError('email')
    }
    const user = await this.userModel.findOne({ email })
    if (!user) {
      return null
    }
    return user
  }
}
