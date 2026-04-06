"use client"

import type React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Mail, ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const { formState: { isSubmitting, errors, isSubmitSuccessful } } = form

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        toast.error("Failed to send reset link", {
          description: error.message,
        })
        return
      }

      toast.success("Reset link sent!", {
        description: "Please check your email for the password reset link.",
      })
    } catch (error: unknown) {
      toast.error("An error occurred", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    }
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
          <h1 className="text-5xl font-bold tracking-tight mb-4 uppercase">Recovery</h1>
          <h2 className="text-2xl font-semibold mb-6 uppercase tracking-wider text-white/90">Smart Persona</h2>
          <p className="text-white/80 leading-relaxed max-w-md">
            Forgot your password? No problem. Enter your email and we'll send you a link to reset it.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full justify-center items-center lg:w-1/2 p-8 sm:p-12 xl:p-24 bg-[#FAFAFA]">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          {!isSubmitSuccessful ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    {...form.register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-2 bg-[#0b5ed7] hover:bg-[#0a58ca] text-white font-medium text-base rounded-md transition-colors shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-600">
                We've sent a password reset link to <br />
                <span className="font-medium text-gray-900">{form.getValues("email")}</span>
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => form.reset()}
              >
                Send again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}