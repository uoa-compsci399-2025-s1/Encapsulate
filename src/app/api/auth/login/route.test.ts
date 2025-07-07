import { StatusCodes } from 'http-status-codes'
import * as nextHeaders from 'next/headers'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

import {
  ADMIN_JWT_MOCK,
  adminMock,
  CLIENT_JWT_MOCK,
  clientMock,
  TURNSTILE_TOKEN_KEY_MOCK,
} from '@/test-config/mocks/Auth.mock'
import AuthDataService from '@/data-layer/services/AuthDataService'
import AuthService from '@/business-layer/services/AuthService'
import { createMockNextPostRequest } from '@/test-config/utils'
import { AUTH_COOKIE_NAME } from '@/types/Auth'
import { POST } from './route'

describe('tests /api/auth/login', async () => {
  const authService = new AuthService()
  const authDataService = new AuthDataService()

  const mockSet = vi.fn()
  beforeAll(() => {
    const mockCookieStore: Partial<ReadonlyRequestCookies> = {
      set: mockSet,
    }

    vi.spyOn(nextHeaders, 'cookies').mockImplementation(
      async () => mockCookieStore as ReadonlyRequestCookies,
    )
  })

  it('should login a client to the client page', async () => {
    await authDataService.createAuth({
      email: clientMock.email,
      password: await authService.hashPassword('password123'),
    })

    const res = await POST(
      createMockNextPostRequest('/api/auth/login', {
        email: clientMock.email,
        password: 'password123',
        token: TURNSTILE_TOKEN_KEY_MOCK,
      }),
    )

    expect(mockSet).toHaveBeenCalledWith(AUTH_COOKIE_NAME, CLIENT_JWT_MOCK, {
      maxAge: 60 * 60,
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    })
    const json = await res.json()
    expect(json).toEqual({ message: 'Login successful', redirect: '/client' })
  })

  it('should login an admin to the admin page', async () => {
    await authDataService.createAuth({
      email: adminMock.email,
      password: await authService.hashPassword('password123'),
    })

    const res = await POST(
      createMockNextPostRequest('/api/auth/login', {
        email: adminMock.email,
        password: 'password123',
        token: TURNSTILE_TOKEN_KEY_MOCK,
      }),
    )

    expect(mockSet).toHaveBeenCalledWith(AUTH_COOKIE_NAME, ADMIN_JWT_MOCK, {
      maxAge: 60 * 60,
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    })
    const json = await res.json()
    expect(json).toEqual({ message: 'Login successful', redirect: '/admin' })
  })

  it('should return a 401 if the body is malformed', async () => {
    const response = await POST(
      createMockNextPostRequest('/api/auth/login', {
        password: 'password123',
      }),
    )

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect((await response.json()).error).toBe('Invalid request body')
  })

  it('should return a 401 if the email or password is incorrect', async () => {
    await authDataService.createAuth({
      email: clientMock.email,
      password: await authService.hashPassword('password123'),
    })

    const res = await POST(
      createMockNextPostRequest('/api/auth/login', {
        email: clientMock.email,
        password: 'wrongpassword',
        token: TURNSTILE_TOKEN_KEY_MOCK,
      }),
    )
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    expect((await res.json()).error).toBe('Invalid email or password')

    const res2 = await POST(
      createMockNextPostRequest('/api/auth/login', {
        email: 'wrongemail@example.com',
        password: 'password123',
        token: TURNSTILE_TOKEN_KEY_MOCK,
      }),
    )
    expect(res2.status).toBe(StatusCodes.UNAUTHORIZED)
    expect((await res2.json()).error).toBe('Invalid email or password')
  })

  it('should return a 401 if the cloudflare turnstile fails', async () => {
    const res = await POST(
      createMockNextPostRequest('/api/auth/login', {
        email: 'whatdafuq@gmail.com',
        password: 'password123',
        token: '',
      }),
    )
    expect(res.status).toBe(StatusCodes.BAD_REQUEST)
    expect((await res.json()).error).toBe('Invalid token')
  })
})
