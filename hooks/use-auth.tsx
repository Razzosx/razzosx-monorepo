"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
    email: string,
    password: string,
    userData?: {
      firstName?: string
      lastName?: string
      mobile?: string
    },
  ) => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateUserProfile: (profile: UserProfile) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Global variable to store the subscription
let authSubscription: { unsubscribe: () => void } | null = null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdminStatus(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes - only if there's no active subscription
    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          checkAdminStatus(session.user.id)
        } else {
          setIsAdmin(false)
        }
        setLoading(false)
      })

      authSubscription = data.subscription
    }

    return () => {
      // We don't cancel the subscription here to avoid recreating it
    }
  }, [])

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase.from("users").select("is_admin").eq("id", userId).single()
      setIsAdmin(data?.is_admin ?? false)
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // Update user state immediately after successful login
      if (!error && data.user) {
        setUser(data.user)
        await checkAdminStatus(data.user.id)
      }

      return { error }
    } catch (error) {
      console.error("Login error:", error)
      return { error }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData?: {
      firstName?: string
      lastName?: string
      mobile?: string
    },
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      // Create user profile
      if (!error && data.user) {
        // Primeiro, inserimos o registro básico do usuário
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
        })

        // Verificamos se a tabela user_profiles existe
        const { error: tableCheckError } = await supabase.from("user_profiles").select("id").limit(1).single()

        // Se a tabela existir, inserimos os dados do perfil
        if (!tableCheckError || !tableCheckError.message.includes("does not exist")) {
          // Criamos o perfil do usuário com informações adicionais
          await supabase.from("user_profiles").insert({
            user_id: data.user.id,
            first_name: userData?.firstName || null,
            last_name: userData?.lastName || null,
            phone: userData?.mobile || null,
          })
        } else {
          console.log("user_profiles table does not exist yet. This is normal if you haven't run the migration.")
        }
      }

      return { error }
    } catch (error) {
      console.error("Signup error:", error)
      return { error }
    }
  }

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) {
      return { error: new Error("User not authenticated") }
    }

    try {
      // Verificamos se a tabela user_profiles existe
      const { error: tableCheckError } = await supabase.from("user_profiles").select("id").limit(1).single()

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        return { error: new Error("Profile table does not exist") }
      }

      // Verificamos se o perfil já existe
      const { data: existingProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (existingProfile) {
        // Atualizamos o perfil existente
        const { error } = await supabase
          .from("user_profiles")
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        return { error }
      } else {
        // Criamos um novo perfil
        const { error } = await supabase.from("user_profiles").insert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        })

        return { error }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Signout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        resetPassword,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
