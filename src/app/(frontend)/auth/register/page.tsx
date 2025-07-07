'use client'

import Button from '@/components/Generic/Button/Button'
import Input from '@/components/Generic/Input/InputField'
import { MdOutlineMail, MdLock } from 'react-icons/md'
import { FcGoogle } from 'react-icons/fc'
import { FaChevronDown } from 'react-icons/fa'
import Link from 'next/link'
import { handleRegister } from '@/lib/services/user/Handlers'
import { useState } from 'react'
import { BsFillPersonFill } from 'react-icons/bs'
import { Turnstile } from 'next-turnstile'

export default function RegisterPage() {
  const [errorState, setErrorState] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [role, setRole] = useState('')
  const [turnstileStatus, setTurnstileStatus] = useState<
    'success' | 'error' | 'expired' | 'required'
  >('required')

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (turnstileStatus !== 'success') {
      setErrorState(true)
      return setErrorMessage('Security check failed. Please try again.')
    }
    setErrorState(false)
    setErrorMessage('')
    const formData = new FormData(e.currentTarget)
    const res = await handleRegister(formData)

    if (res?.error) {
      setErrorMessage(res.error)
      setErrorState(true)
    }
  }

  const isPlaceholder = role === ''

  return (
    <div className="flex flex-col justify-center items-start gap-4 pt-20 lg:pt-0">
      <p className="text-xl font-extrabold text-dark-blue pl-2">KIA ORA</p>
      <form onSubmit={submitForm}>
        <div className="flex flex-col gap-4 relative z-[51]">
          <div className="relative inline-block w-full">
            <select
              defaultValue=""
              name="role"
              onChange={(e) => setRole(e.target.value)}
              required
              className={`appearance-none ring-muted-blue ring-1 focus:ring-3 w-full pl-11 focus:outline-hidden rounded-lg px-4 py-2.5 text-sm ${isPlaceholder ? 'text-deeper-blue bg-white' : 'text-steel-blue bg-muted-blue-op-45'}`}
            >
              <option value="" disabled className="text-muted-blue">
                Role
              </option>
              <option value="client">Client</option>
              <option value="student">Student</option>
            </select>
            <span className="absolute left-4 top-7/13 -translate-y-1/2 h-3 w-3">
              <FaChevronDown className="text-deeper-blue h-full" />
            </span>
          </div>
          <Input
            name="firstName"
            placeholder="First Name"
            type="firstName"
            startIcon={<BsFillPersonFill className="text-muted-blue h-full" />}
            required={true}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            type="lastName"
            startIcon={<BsFillPersonFill className="text-muted-blue h-full" />}
            required={true}
          />
          <Input
            name="email"
            placeholder="Email Address"
            type="email"
            startIcon={<MdOutlineMail className="text-muted-blue h-full" />}
            required={true}
          />
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
            <p className="text-xs">Register</p>
          </Button>
          <div className="flex items-center justify-center h-fill">
            <p className="text-steel-blue text-xs text-center">
              {'Already have an account? Log in '}
              <Link href="/auth/login">
                <u>here</u>
              </Link>
            </p>
          </div>
          <div className="flex items-center w-full pt-2 pb-3">
            <div className="border-t border-steel-blue flex-grow"></div>
            <span className="mx-4 text-steel-blue text-xs">OR</span>
            <div className="border-t border-steel-blue flex-grow"></div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-3">
          <Link href="/api/auth/google?role=client">
            <Button
              className="bg-white w-full"
              size="md"
              variant="outline"
              startIcon={<FcGoogle className="h-full" />}
            >
              <p className="text-xs text-center pt-0.5">
                Sign Up as a <b>Client</b>
              </p>
            </Button>
          </Link>
          <Link href="/api/auth/google?role=student">
            <Button
              className="bg-white w-full"
              size="md"
              variant="outline"
              startIcon={<FcGoogle className="h-full" />}
            >
              <p className="text-xs text-center pt-0.5">
                Sign Up as a <b>Student</b>
              </p>
            </Button>
          </Link>
          <Turnstile
            appearance="execute"
            theme="light"
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            retry="auto"
            refreshExpired="auto"
            sandbox={process.env.NODE_ENV !== 'production'}
            onError={() => {
              setTurnstileStatus('error')
              setErrorState(true)
              setErrorMessage('Security check failed. Please try again.')
            }}
          />
        </div>
      </form>
    </div>
  )
}
