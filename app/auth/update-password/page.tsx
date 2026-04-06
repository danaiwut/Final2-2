"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Lock } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrength } from "@/components/ui/password-strength"

const updatePasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isReady, setIsReady] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if the user is authenticated (they should be if they clicked the reset link)
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Invalid or expired link. Please request a new password reset.")
        router.push("/auth/forgot-password")
      } else {
        setIsReady(true)
      }
    }
    checkUser()
  }, [supabase, router])

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const passwordValue = form.watch("password")
  const { formState: { isSubmitting, errors } } = form

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error("Failed to update password", {
          description: error.message,
        })
        return
      }

      toast.success("Password updated successfully!", {
        description: "You can now sign in with your new password.",
      })
      
      // Sign out the user strictly after password reset so they login again
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error: any) {
      toast.error("An error occurred", {
        description: error.message || "Please try again later.",
      })
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0b5ed7] overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0d6efd]/20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#3d8bfd]/20 blur-2xl" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#0a58ca]/40" />
        <div className="absolute bottom-10 left-10 w-[200px] h-[200px] rounded-full bg-[#3d8bfd]/30" />

        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight mb-4 uppercase">Secure</h1>
          <h2 className="text-2xl font-semibold mb-6 uppercase tracking-wider text-white/90">Smart Persona</h2>
          <p className="text-white/80 leading-relaxed max-w-md">
            Update your credentials. A strong password keeps your professional identities and personal data safe.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full justify-center items-center lg:w-1/2 p-8 sm:p-12 xl:p-24 bg-[#FAFAFA]">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
            <p className="text-gray-500 text-sm">Please choose a strong password for your account.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Password Input */}
            <div className="space-y-1">
               <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="pl-10 pr-16 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-xs font-semibold text-[#0b5ed7] hover:text-[#0a58ca] uppercase tracking-wide"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={passwordValue} className="mt-1.5" />
              {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
               <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="pl-10 pr-16 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-xs font-semibold text-[#0b5ed7] hover:text-[#0a58ca] uppercase tracking-wide"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-[#0b5ed7] hover:bg-[#0a58ca] text-white font-medium text-base rounded-md transition-colors shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
