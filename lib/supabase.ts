const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANONKEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Cliente único e simples
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          created_at: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          created_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          created_at?: string
          active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          status: "pending" | "paid" | "cancelled"
          payment_method: string | null
          payment_link: string | null
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          status?: "pending" | "paid" | "cancelled"
          payment_method?: string | null
          payment_link?: string | null
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          status?: "pending" | "paid" | "cancelled"
          payment_method?: string | null
          payment_link?: string | null
          transaction_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
