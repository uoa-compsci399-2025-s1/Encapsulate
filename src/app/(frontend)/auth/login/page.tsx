'use client'

import Button from '@/components/Generic/Button/Button'
import Input from '@/components/Generic/Input/InputField'
import { MdOutlineMail, MdLock } from 'react-icons/md'
import { FcGoogle } from 'react-icons/fc'
import Link from 'next/link'
import { handleLogin } from '@/lib/services/user/Handlers'
import { useState } from 'react'
import { redirect } from 'next/navigation'
import { Turnstile } from 'next-turnstile'

export default function LoginPage() {
  const [errorState, setErrorState] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('')
  const [emailErrorState, setEmailErrorState] = useState<boolean>(false)
  const [turnstileStatus, setTurnstileStatus] = useState<
    'success' | 'error' | 'expired' | 'required'
  >('required')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (turnstileStatus !== 'success') {
      setErrorState(true)
      return setErrorMessage('Security check failed. Please try again.')
    }
    setErrorState(false)
    setErrorMessage('')
    setEmailErrorMessage('')
    setEmailErrorState(false)

    const formData = new FormData(e.currentTarget)
    const res = await handleLogin(formData)

    if (res.redirect) redirect(res.redirect)

    if (res?.error) {
      if (res.error === 'Invalid email address format') {
        setEmailErrorMessage(res.error)
        setEmailErrorState(true)
      } else {
        setErrorMessage(res.error)
        setErrorState(true)
      }
    }
  }

  return (
    <div className="flex flex-col justify-center items-start gap-4">
      <p className="text-xl font-extrabold text-dark-blue pl-2">WELCOME BACK</p>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4 relative z-[51]">
          <div>
            <Input
              name="email"
              placeholder="Email Address"
              type="email"
              startIcon={<MdOutlineMail className="text-muted-blue h-full" />}
              error={errorState || emailErrorState}
              errorMessage={emailErrorMessage}
              required={true}
            />
          </div>
          <div>
            <Input
              name="password"
              placeholder="Password"
              type="password"
              startIcon={<MdLock className="text-muted-blue h-full" />}
              error={errorState}
              errorMessage={errorMessage}
              required={true}
            />
          </div>
          <Button size="md" variant="dark" type="submit">
            <p className="text-xs">Log In</p>
          </Button>
          <p className="text-steel-blue text-xs text-center">
            {"Don't have an account? Sign up "}
            <Link href="/auth/register">
              <u>here</u>
            </Link>
          </p>
          <div>
            <div className="flex items-center w-full pt-2 pb-3">
              <div className="border-t border-steel-blue flex-grow"></div>
              <span className="mx-4 text-steel-blue text-xs">OR</span>
              <div className="border-t border-steel-blue flex-grow"></div>
            </div>
            <Link href="/api/auth/google">
              <Button
                className="bg-white w-full"
                size="md"
                variant="outline"
                startIcon={<FcGoogle className="h-full" />}
              >
                <p className="text-xs text-center pt-0.5">Sign In with Google</p>
              </Button>
            </Link>
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              appearance="interaction-only"
              theme="light"
              retry="auto"
              refreshExpired="auto"
              sandbox={process.env.NODE_ENV !== 'production'}
              onError={() => {
                setTurnstileStatus('error')
                setEmailErrorState(true)
                setEmailErrorMessage('Security check failed. Please try again.')
              }}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
