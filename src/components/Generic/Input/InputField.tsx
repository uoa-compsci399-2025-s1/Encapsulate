'use client'
import type { FC, ReactNode, InputHTMLAttributes } from 'react'
import React, { useState } from 'react'
import { HiExclamation } from 'react-icons/hi'
import { LuEyeOff, LuEye } from 'react-icons/lu'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | string
  className?: string
  error?: boolean
  errorMessage?: string
  startIcon?: ReactNode
  endIcon?: ReactNode
}

const Input: FC<InputProps> = ({
  type = 'text',
  className = '',
  error = false,
  errorMessage = '',
  startIcon,
  endIcon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'
  const actualType = isPasswordType && showPassword ? 'text' : type
  const inputClasses = `${error ? 'ring-pink-accent ring-1 focus:ring-2' : 'ring-muted-blue ring-1 focus:ring-3'} ${startIcon ? 'pl-11' : ''} w-full placeholder-muted-blue text-steel-blue focus:outline-hidden rounded-lg px-4 py-2.5 text-sm bg-white ${className}`

  return (
    <>
      <div className="relative">
        {startIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5">{startIcon}</span>
        )}
        <input type={actualType} className={inputClasses} {...props} />
        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-blue cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
          </button>
        ) : endIcon ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5">{endIcon}</span>
        ) : null}
      </div>
      {error && errorMessage != '' && (
        <div className="flex items-center gap-2 text-xs text-pink-accent min-h-[1.25rem] mt-2">
          <HiExclamation className="w-3 h-3" />
          <p>{errorMessage}</p>
        </div>
      )}
    </>
  )
}

export default Input
