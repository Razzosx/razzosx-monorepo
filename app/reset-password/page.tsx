"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/hooks/use-language"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar se há um token de reset na URL
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken && refreshToken) {
      // Definir a sessão com os tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />

        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <Card className="glass border-[#00ADB5]/20 text-center">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#EEEEEE] mb-4">Password Updated!</h2>
                <p className="text-[#EEEEEE]/70 mb-6">
                  Your password has been successfully updated. You will be redirected to login.
                </p>
                <Button asChild className="bg-gradient-to-r from-[#00ADB5] to-[#008B94] text-[#EEEEEE]">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center slide-in-up">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <Image src="/images/razzosx-logo.png" alt="Razzosx DMA" fill className="object-contain" />
            </div>
            <h2 className="text-3xl font-bold text-[#EEEEEE]">Reset Your Password</h2>
            <p className="mt-2 text-sm text-[#EEEEEE]/70">Enter your new password below</p>
          </div>

          <Card className="glass border-[#00ADB5]/20 slide-in-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="text-[#EEEEEE]">New Password</CardTitle>
              <CardDescription className="text-[#EEEEEE]/70">Choose a strong password for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#EEEEEE]">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                      placeholder="Enter new password"
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 text-[#EEEEEE]/50 hover:text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#EEEEEE]">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 text-[#EEEEEE]/50 hover:text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE] btn-interactive"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center slide-in-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
