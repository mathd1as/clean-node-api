const { MissingParamError } = require('../../presentation/utils/errors')

class AuthUseCase {
  constructor (LoadUserByEmailRepository) {
    this.LoadUserByEmailRepository = LoadUserByEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      return new MissingParamError('email')
    }
    if (!password) {
      return new MissingParamError('password')
    }
    this.LoadUserByEmailRepository.load(email)
  }
}

const makeSut = () => {
  class LoadUserByEmailRepository {
    async load (email) {
      this.email = email
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepository()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)

  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('Auth UseCase', () => {
  // test('Should throw if no email is provided', async () => {
  //   const sut = new AuthUseCase()
  //   const promise = sut.auth()
  //   expect(promise).rejects.toThrow(new MissingParamError('email'))
  // })

  // test('Should throw if no password is provided', async () => {
  //   const sut = new AuthUseCase()
  //   const promise = sut.auth('any_email@email.com')
  //   expect(promise).rejects.toThrow(new MissingParamError('password'))
  // })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })
})
