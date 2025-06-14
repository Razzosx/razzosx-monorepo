"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Phone, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [mobile, setMobile] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [honeypot, setHoneypot] = useState("") // Honeypot field for security
  const [confirmPassword, setConfirmPassword] = useState("")

  const { signIn, signUp, resetPassword, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "login"

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      const redirectTo = searchParams.get("redirect") || "/"
      router.push(redirectTo)
    }
  }, [user, router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Honeypot check - if filled, it's probably a bot
    if (honeypot) {
      console.log("Honeypot triggered")
      setError("Invalid credentials")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError("Invalid credentials")
        setLoading(false)
      } else {
        // Small delay to ensure user state is updated before redirect
        setTimeout(() => {
          const redirectTo = searchParams.get("redirect") || "/"
          router.push(redirectTo)
        }, 100)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Invalid credentials")
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Honeypot check
    if (honeypot) {
      console.log("Honeypot triggered")
      setError("Invalid request")
      return
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Passamos todos os dados do usuário para o hook signUp
      const { error } = await signUp(email, password, {
        firstName,
        lastName,
        mobile,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Account created successfully! Please check your email to confirm your registration.")
        // Clear form fields
        setEmail("")
        setPassword("")
        setFirstName("")
        setLastName("")
        setMobile("")
        setConfirmPassword("")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Honeypot check
    if (honeypot) {
      console.log("Honeypot triggered")
      setError("Invalid request")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await resetPassword(resetEmail)

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Password reset email sent! Please check your inbox.")
        setShowResetForm(false)
        setResetEmail("")
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADB5]"></div>
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
            <h2 className="text-3xl font-bold text-[#EEEEEE]">
              {showResetForm ? "Reset Your Password" : "Welcome to Razzosx DMA"}
            </h2>
            <p className="mt-2 text-sm text-[#EEEEEE]/70">
              {showResetForm
                ? "Enter your email to reset your password"
                : "Sign in to your account or create a new one"}
            </p>
          </div>

          <Card className="glass border-[#00ADB5]/20 slide-in-up" style={{ animationDelay: "0.2s" }}>
            {showResetForm ? (
              // Reset Password Form
              <>
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE]">Reset Password</CardTitle>
                  <CardDescription className="text-[#EEEEEE]/70">
                    We'll send you an email with instructions to reset your password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-[#EEEEEE]">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Honeypot field - invisible to real users */}
                    <div className="hidden">
                      <Label htmlFor="website" className="text-[#EEEEEE]">
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="text"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {error && (
                      <Alert className="bg-red-500/10 border-red-500/20">
                        <AlertDescription className="text-red-400">{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-green-500/10 border-green-500/20">
                        <AlertDescription className="text-green-400">{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE] btn-interactive"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send Reset Email"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-[#00ADB5] hover:bg-[#00ADB5]/10"
                        onClick={() => {
                          setShowResetForm(false)
                          setError("")
                          setSuccess("")
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            ) : (
              // Login/Register Tabs
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#393E46]">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#EEEEEE]"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#EEEEEE]"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <CardHeader>
                    <CardTitle className="text-[#EEEEEE]">Sign In</CardTitle>
                    <CardDescription className="text-[#EEEEEE]/70">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#EEEEEE]">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#EEEEEE]">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                            placeholder="Enter your password"
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

                      {/* Honeypot field - invisible to real users */}
                      <div className="hidden">
                        <Label htmlFor="website" className="text-[#EEEEEE]">
                          Website
                        </Label>
                        <Input
                          id="website"
                          type="text"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      <div className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[#00ADB5] hover:bg-[#00ADB5]/10 p-0 h-auto"
                          onClick={() => setShowResetForm(true)}
                        >
                          Forgot Password?
                        </Button>
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
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>

                <TabsContent value="register">
                  <CardHeader>
                    <CardTitle className="text-[#EEEEEE]">Create Account</CardTitle>
                    <CardDescription className="text-[#EEEEEE]/70">
                      Register for a new account to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-[#EEEEEE]">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                            <Input
                              id="first-name"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="pl-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                              placeholder="First name"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-[#EEEEEE]">
                            Last Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                            <Input
                              id="last-name"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="pl-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                              placeholder="Last name"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-[#EEEEEE]">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                          <Input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-[#EEEEEE]">
                          Mobile (with country code)
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                          <Input
                            id="mobile"
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="pl-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                            placeholder="+1 (123) 456-7890"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-[#EEEEEE]">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                            placeholder="Create a password"
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
                        <Label htmlFor="confirm-password" className="text-[#EEEEEE]">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] focus:border-[#00ADB5]"
                            placeholder="Confirm your password"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      {/* Honeypot field - invisible to real users */}
                      <div className="hidden">
                        <Label htmlFor="website-register" className="text-[#EEEEEE]">
                          Website
                        </Label>
                        <Input
                          id="website-register"
                          type="text"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      {error && (
                        <Alert className="bg-red-500/10 border-red-500/20">
                          <AlertDescription className="text-red-400">{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="bg-green-500/10 border-green-500/20">
                          <AlertDescription className="text-green-400">{success}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE] btn-interactive"
                        disabled={loading}
                      >
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            )}
          </Card>

          <div className="text-center slide-in-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
