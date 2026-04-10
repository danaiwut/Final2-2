"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Mail } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function VerifyOtpForm() {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const email = searchParams.get("email")

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Email not found. Please try signing up again.")
      return
    }

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code.")
      return
    }

    setIsVerifying(true)
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      })

      if (error) {
        toast.error("Verification failed", {
          description: error.message,
        })
        return
      }

      toast.success("Email verified successfully!")
      router.push("/dashboard")
      
    } catch (error: any) {
      toast.error("An error occurred", {
        description: error.message || "Please try again later.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#FAFAFA] p-6">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-sm rounded-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <ShieldCheck className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Enter Verification Code</CardTitle>
              <CardDescription className="text-base text-gray-500">
                We've sent a 6-digit code to <br />
                <span className="font-semibold text-gray-900">{email || "your email"}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleVerify} className="space-y-4 text-center">
              <div className="flex justify-center">
                <Input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="h-14 w-full text-center text-3xl font-mono tracking-widest bg-gray-50/50 border-gray-200"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base rounded-md transition-colors shadow-sm"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>
            </form>

            <div className="space-y-3 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code? {" "}
                <Link href="/auth/login" className="font-semibold text-indigo-600 hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
