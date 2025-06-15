"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { fetchWithRetry } from "@/lib/network"

interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  products: {
    id: string
    name: string
    price: number
    currency: string
    image_url: string | null
    is_limited: boolean
    current_stock: number | null
  }
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchCart = async () => {
    if (!user) {
      setItems([])
      return
    }

    try {
      setLoading(true)

      const cartData = await fetchWithRetry(
        async () => {
          const { data, error } = await supabase
            .from("cart_items")
            .select(`
              *,
              products (
                id,
                name,
                price,
                currency,
                image_url,
                is_limited,
                current_stock
              )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (error) throw error
          return data || []
        },
        { key: "cart-fetch" },
      )

      setItems(cartData)
    } catch (error) {
      console.error("Error fetching cart:", error)
      setItems([]) // Fallback para array vazio
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      })
      return
    }

    try {
      const existingItem = items.find((item) => item.product_id === productId)

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity)
        return
      }

      await fetchWithRetry(
        async () => {
          const { error } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          })
          if (error) throw error
        },
        { key: "cart-add" },
      )

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      })

      await fetchCart()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Connection Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      await fetchWithRetry(
        async () => {
          const { error } = await supabase.from("cart_items").delete().eq("id", itemId)
          if (error) throw error
        },
        { key: "cart-remove" },
      )

      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart",
      })

      // Atualiza localmente para evitar nova chamada
      setItems(items.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      await fetchWithRetry(
        async () => {
          const { error } = await supabase
            .from("cart_items")
            .update({
              quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", itemId)
          if (error) throw error
        },
        { key: "cart-update" },
      )

      // Atualiza localmente para evitar nova chamada
      setItems(items.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      await fetchWithRetry(
        async () => {
          const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)
          if (error) throw error
        },
        { key: "cart-clear" },
      )

      setItems([])
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + item.products.price * item.quantity
    }, 0)
  }

  const refreshCart = async () => {
    await fetchCart()
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
