"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Lock, Mail, Building2, Globe, Phone, FileText } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const companySignUpSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  registrationNumber: z.string().min(3, { message: "Registration number is required." }),
  companyWebsite: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  phone: z.string().min(9, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type CompanySignUpValues = z.infer<typeof companySignUpSchema>

export default function CompanySignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<CompanySignUpValues>({
    resolver: zodResolver(companySignUpSchema),
    defaultValues: {
      companyName: "",
      registrationNumber: "",
      companyWebsite: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { formState: { isSubmitting, errors } } = form

  const onSubmit = async (data: CompanySignUpValues) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: data.companyName,
            role: "company",
            company_name: data.companyName,
            company_registration_number: data.registrationNumber,
            company_website: data.companyWebsite || null,
            company_phone: data.phone,
          },
        },
      })

      if (error) {
        toast.error("Sign up failed", { description: error.message })
        return
      }

      toast.success("Company account created! Please check your email to verify.")
      router.push("/auth/sign-up-success")
    } catch (error: any) {
      toast.error("An error occurred", { description: error.message || "Please try again later." })
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, #6C3FC5 0%, #4F46E5 50%, #3B82F6 100%)" }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-[30%] right-[15%] w-[200px] h-[200px] rounded-full bg-purple-400/20 blur-xl" />

        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Register Your Company</h1>
          <h2 className="text-xl font-semibold mb-6 text-white/90">Smart Persona for Business</h2>
          <p className="text-white/80 leading-relaxed max-w-md">
            Post job opportunities, connect with top talent, and build your company&apos;s presence on the Smart Persona platform.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: "✓", text: "Post unlimited job listings" },
              { icon: "✓", text: "Access professional resumes" },
              { icon: "✓", text: "Verified company badge" },
              { icon: "✓", text: "Post in the community" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full justify-center items-center lg:w-1/2 p-8 sm:p-12 xl:p-16 bg-[#FAFAFA]">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Company Registration</h2>
            <p className="text-gray-500 text-sm">Create your company account to get started.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Company Name */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Building2 className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Company Name"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("companyName")}
                />
              </div>
              {errors.companyName && <p className="text-xs text-red-500 font-medium ml-1">{errors.companyName.message}</p>}
            </div>

            {/* Registration Number */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <FileText className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Business Registration Number"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("registrationNumber")}
                />
              </div>
              {errors.registrationNumber && <p className="text-xs text-red-500 font-medium ml-1">{errors.registrationNumber.message}</p>}
            </div>

            {/* Website */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Globe className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type="url"
                  placeholder="Company Website (optional)"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("companyWebsite")}
                />
              </div>
              {errors.companyWebsite && <p className="text-xs text-red-500 font-medium ml-1">{errors.companyWebsite.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Phone className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("phone")}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 font-medium ml-1">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Company Email"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-10 pr-16 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base rounded-md transition-colors shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register Company"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Not a company?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign up as User
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
