import { StatusCodes } from 'http-status-codes'

import type { RegisterRequestBody } from './route'
import { POST } from './route'
import { createMockNextPostRequest } from '@/test-config/utils'
import { UserRole, UserRoleWithoutAdmin } from '@/types/User'
import UserDataService from '@/data-layer/services/UserDataService'
import AuthDataService from '@/data-layer/services/AuthDataService'
import { TURNSTILE_TOKEN_KEY_MOCK } from '@/test-config/mocks/Auth.mock'

describe('tests /api/auth/register', () => {
  const userDataService = new UserDataService()
  const authDataService = new AuthDataService()

  it('should register a new user', async () => {
    const body: RegisterRequestBody = {
      firstName: 'jeffery',
      lastName: 'ji',
      email: 'test@example.com',
      password: 'password123',
      role: UserRoleWithoutAdmin.Client,
      token: TURNSTILE_TOKEN_KEY_MOCK,
    }
    const res = await POST(createMockNextPostRequest('/api/auth/register', body))
    const json = await res.json()

    expect(res.status).toBe(StatusCodes.CREATED)
    expect(json.message).toBe('User registered successfully')
    expect(json.data).toHaveProperty('id')

    const user = await userDataService.getUser(json.data.id)
    expect(user.firstName).toEqual(body.firstName)
    expect(user.lastName).toEqual(body.lastName)
    expect(user.email).toEqual(body.email)
    expect(user.role).toEqual(body.role)

    const auth = await authDataService.getAuthByEmail(body.email)
    expect(auth.password).not.toEqual(body.password)
  })

  it('should use an existing user when signing up', async () => {
    const body: RegisterRequestBody = {
      firstName: 'jeffery',
      lastName: 'ji',
      email: 'test@example.com',
      password: 'password123',
      role: UserRoleWithoutAdmin.Client,
      token: TURNSTILE_TOKEN_KEY_MOCK,
    }
    await userDataService.createUser(body)
    const allUsersBeforeRegister = (await userDataService.getAllUsers()).docs

    await POST(createMockNextPostRequest('/api/auth/register', body))
    const currentAllUsers = (await userDataService.getAllUsers()).docs
    expect(currentAllUsers.length).toEqual(allUsersBeforeRegister.length)
  })

  it('should return a 409 conflict if user already exists', async () => {
    const body: RegisterRequestBody = {
      firstName: 'jeffery',
      lastName: 'ji',
      email: 'test@example.com',
      password: 'password123',
      role: UserRoleWithoutAdmin.Client,
      token: TURNSTILE_TOKEN_KEY_MOCK,
    }
    await POST(createMockNextPostRequest('/api/auth/register', body))

    const res = await POST(createMockNextPostRequest('/api/register', body))
    const json = await res.json()

    expect(res.status).toBe(StatusCodes.CONFLICT)
    expect(json.error).toBe('A user with that email already exists')
  })

  it('should return a 400 bad request if the payload is invalid', async () => {
    const body = {
      firstName: 'jeffery',
      lastName: 'ji',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.Admin,
      token: TURNSTILE_TOKEN_KEY_MOCK,
    }
    await POST(createMockNextPostRequest('/api/auth/register', body))

    const res = await POST(createMockNextPostRequest('/api/auth/register', body))
    const json = await res.json()

    expect(res.status).toBe(StatusCodes.BAD_REQUEST)
    expect(json.error).toBe('Invalid request body')
  })
})
