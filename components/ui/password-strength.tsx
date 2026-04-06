import React from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password?: string
  className?: string
}

export function PasswordStrength({ password = "", className }: PasswordStrengthProps) {
  // Simple check for password strength
  const minLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  let score = 0
  if (minLength) score += 1
  if (hasUpper && hasLower) score += 1
  if (hasNumber) score += 1
  if (hasSpecial) score += 1

  // Color mapping based on score
  const getBarColor = (index: number) => {
    if (score === 0) return "bg-gray-200"
    if (score === 1 && index < 1) return "bg-red-500"
    if (score === 2 && index < 2) return "bg-orange-500"
    if (score === 3 && index < 3) return "bg-yellow-500"
    if (score >= 4 && index < 4) return "bg-green-500"
    return "bg-gray-200"
  }

  const getLabel = () => {
    if (password.length === 0) return "Enter password"
    if (score === 1) return "Weak"
    if (score === 2) return "Fair"
    if (score === 3) return "Good"
    if (score >= 4) return "Strong"
    return "Too short"
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex gap-1 h-1.5 w-full">
        <div className={cn("h-full w-1/4 rounded-full transition-colors duration-300", getBarColor(0))} />
        <div className={cn("h-full w-1/4 rounded-full transition-colors duration-300", getBarColor(1))} />
        <div className={cn("h-full w-1/4 rounded-full transition-colors duration-300", getBarColor(2))} />
        <div className={cn("h-full w-1/4 rounded-full transition-colors duration-300", getBarColor(3))} />
      </div>
      <p className="text-[10px] text-right text-gray-500 font-medium uppercase tracking-wider">
        {getLabel()}
      </p>
    </div>
  )
}
