import AuthService from '@/business-layer/services/AuthService'
import UserDataService from '@/data-layer/services/UserDataService'
import AuthDataService from '@/data-layer/services/AuthDataService'
import type { CreateUserData } from '@/types/Collections'
import { UserRoleWithoutAdmin } from '@/types/User'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import type { User } from '@/payload-types'
import { validateTurnstileToken } from 'next-turnstile'
import { v4 } from 'uuid'

export const RegisterRequestBodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.nativeEnum(UserRoleWithoutAdmin),
  token: z.string(),
})
export type RegisterRequestBody = z.infer<typeof RegisterRequestBodySchema>

export const POST = async (req: NextRequest) => {
  const userDataService = new UserDataService()
  const authService = new AuthService()
  const authDataService = new AuthDataService()

  try {
    const body = RegisterRequestBodySchema.parse(await req.json())

    const validationResponse = await validateTurnstileToken({
      token: body.token,
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
      // Optional: Add an idempotency key to prevent token reuse
      idempotencyKey: v4(),
      sandbox: process.env.NODE_ENV !== 'production',
    })
    if (!validationResponse.success && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Invalid token' }, { status: StatusCodes.BAD_REQUEST })
    }

    let user: User

    const auth = await authDataService.getAuthByEmail(body.email)
    if (auth)
      return NextResponse.json(
        { error: 'A user with that email already exists' },
        { status: StatusCodes.CONFLICT },
      )

    try {
      user = await userDataService.getUserByEmail(body.email)
      user = await userDataService.updateUser(user.id, {
        firstName: body.firstName,
        lastName: body.lastName,
      })
    } catch {
      user = await userDataService.createUser(body as CreateUserData)
    }

    const hash = await authService.hashPassword(body.password)
    await authDataService.createAuth({
      email: body.email,
      password: hash,
    })

    return NextResponse.json(
      { message: 'User registered successfully', data: user },
      {
        status: StatusCodes.CREATED,
      },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.flatten() },
        { status: StatusCodes.BAD_REQUEST },
      )
    }
    console.error('Error', error)
    return NextResponse.json(
      { error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    )
  }
}
