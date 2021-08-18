const { MissingParamError } = require('../../presentation/utils/errors')
const AuthUseCase = require('./auth-use-case')

const makeUserByEmailRepository = () => {
  class LoadUserByEmailRepository {
    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepository()
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }

  return loadUserByEmailRepositorySpy
}

const makeUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepository {
    async load (email) {
      throw new Error()
    }
  }

  return LoadUserByEmailRepository
}

const makeEncrypter = () => {
  class EncripterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encrypterSpy = new EncripterSpy()
  encrypterSpy.isValid = true

  return encrypterSpy
}

const makeEncrypterWithError = () => {
  class EncripterSpy {
    async compare () {
      throw new Error()
    }
  }

  return new EncripterSpy()
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userID) {
      this.userID = userID
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate (userID) {
      throw new Error()
    }
  }

  return new TokenGeneratorSpy()
}

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepository {
    async update (userID, accessToken) {
      this.userID = userID
      this.accessToken = accessToken
    }
  }
  return new UpdateAccessTokenRepository()
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository()

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@email.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })

  test('Should return null if LoadUserByEmailRepository returns null', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@email.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth('valid_email@email.com', 'invalid_password')
    expect(accessToken).toBeNull()
  })

  test('Should call Encrypter with correct password values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'any_password')
    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password)
  })

  test('Should call TokenGenerator with correct userID', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')
    expect(tokenGeneratorSpy.userID).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  // test('Should return an accessToken if correct credentials are provided', async () => {
  //   const { sut, tokenGeneratorSpy } = makeSut()
  //   const accessToekn = await sut.auth('valid_email@email.com', 'valid_password')
  //   expect(accessToekn).toBe(tokenGeneratorSpy.accessToekn)
  //   expect(accessToekn).toBeTruthy()
  // })

  test('Should throw if no dependency is provided', async () => {
    const invalid = {}
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({ loadUserByEmailRepository: invalid }),
      new AuthUseCase({ loadUserByEmailRepository: makeUserByEmailRepository() }),
      new AuthUseCase({ loadUserByEmailRepository: makeUserByEmailRepository(), encrypter: invalid }),
      new AuthUseCase({ loadUserByEmailRepository: makeUserByEmailRepository(), encrypter: makeEncrypter() }),
      new AuthUseCase({ loadUserByEmailRepository: makeUserByEmailRepository(), encrypter: makeEncrypter(), tokenGenerator: invalid })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email@email.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if no any dependency throws', async () => {
    const localUserByEmailRepository = makeUserByEmailRepository()
    const encrypter = makeEncrypterWithError()
    const suts = [].concat(
      new AuthUseCase({ localUserByEmailRepository: makeUserByEmailRepositoryWithError() }),
      new AuthUseCase({ localUserByEmailRepository, encrypter: makeEncrypterWithError() }),
      new AuthUseCase({ localUserByEmailRepository, encrypter, tokenGenerator: makeTokenGeneratorWithError() })

    )
    for (const sut of suts) {
      const promise = sut.auth('any_email@email.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })

  test('Should call UpdateAccesTokenRepository', async () => {
    const { sut, updateAccessTokenRepositorySpy, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')
    expect(updateAccessTokenRepositorySpy.userID).toBe(loadUserByEmailRepositorySpy.user.id)
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(tokenGeneratorSpy.accessToken)
  })
})
