import type { LoginRequestBodySchema } from '@/app/api/auth/login/route'
import { POST as Login } from '@/app/api/auth/login/route'
import { buildNextRequestURL } from '@/utils/buildNextRequestURL'
import { buildNextRequest } from '@/utils/buildNextRequest'
import { type StatusCodes } from 'http-status-codes'
import { type typeToFlattenedError } from 'zod'
import type { RegisterRequestBodySchema } from '@/app/api/auth/register/route'
import { POST as Register } from '@/app/api/auth/register/route'
import { GET as Logout } from '@/app/api/auth/logout/route'
import type { UserRoleWithoutAdmin } from '@/types/User'
import type { UserCombinedInfo } from '@/types/Collections'
import { GET as GetUserSelfData } from '@/app/api/users/me/route'

const UserService = {
  /**
   * Logs in a user with the provided email and password.
   *
   * @param options The login options containing the user's email, password, and Cloudflare Turnstile token.
   * @returns A promise resolving to an object containing:
   *   - `message` string: A message indicating the result of the login attempt.
   *   - `redirect` string: A URL to redirect the user after a successful login.
   *   - `status` {@link StatusCodes}: The HTTP status code of the response.
   *   - `error` string: An error message if the login attempt failed.
   *   - `details` {@link typeToFlattenedError}: Validation error details, if any.
   */
  login: async function (options: { email: string; password: string; token: string }): Promise<{
    status: StatusCodes
    message?: string
    redirect?: string
    error?: string
    details?: typeToFlattenedError<typeof LoginRequestBodySchema>
  }> {
    const url = buildNextRequestURL('/api/auth/login', options)
    const response = await Login(await buildNextRequest(url, { method: 'POST', body: options }))
    const { message, redirect, error, details } = await response.json()

    return { message, redirect, status: response.status, error, details }
  },

  /**
   * Registers a new user with the provided details.
   *
   * @param options The registration options containing the user's email, password, first name, last name, role, and Cloudflare Turnstile token.
   * @returns A promise resolving to an object containing:
   *   - `status` {@link StatusCodes}: The HTTP status code of the response.
   *   - `message` string: A message indicating the result of the registration attempt.
   *   - `error` string: An error message if the registration attempt failed.
   *   - `details` {@link typeToFlattenedError}: Validation error details, if any.
   */
  register: async function (options: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRoleWithoutAdmin
    token: string
  }): Promise<{
    status: StatusCodes
    message?: string
    error?: string
    details?: typeToFlattenedError<typeof RegisterRequestBodySchema>
  }> {
    const url = buildNextRequestURL('/api/auth/register', options)
    const response = await Register(await buildNextRequest(url, { method: 'POST', body: options }))
    const { message, error, details } = await response.json()

    return { message, status: response.status, error, details }
  },

  /**
   * Method to get a users own data
   *
   * @returns A promise resolving to an object containing:
   *   - `user` {@link UserCombinedInfo}: The user data, combined with any client additional info.
   *   - `status` {@link StatusCodes}: The HTTP status code of the response.
   */
  getUserSelfData: async function (): Promise<{ user: UserCombinedInfo; status: StatusCodes }> {
    'use server'
    const url = buildNextRequestURL('/api/users/me', {})
    const response = await GetUserSelfData(await buildNextRequest(url, { method: 'GET' }))
    const { data } = await response.json()

    return { user: data, status: response.status }
  },

  /**
   * Logs a user out by clearing their cookies.
   */
  logout: async function (): Promise<void> {
    'use server'
    const url = buildNextRequestURL('/api/auth/logout', {})
    await Logout(await buildNextRequest(url, { method: 'GET' }))
  },
} as const

export default UserService
