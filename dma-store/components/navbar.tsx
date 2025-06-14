"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { CartSidebar } from "@/components/cart-sidebar"
import { useCart } from "@/hooks/use-cart"
import { supabase } from "@/lib/supabase"
import { Menu, X, ShoppingCart, User, LogIn, Bell } from "lucide-react"

export function Navbar() {
  const { user, isAdmin } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { getTotalItems } = useCart()
  const [hasNotifications, setHasNotifications] = useState(false)

  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!user) return

    // Check for unread notifications
    const checkNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("user_notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("read", false)
          .limit(1)

        if (error) throw error
        setHasNotifications(data && data.length > 0)
      } catch (error) {
        console.error("Error checking notifications:", error)
      }
    }

    checkNotifications()

    // Subscribe to notifications
    const channel = supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setHasNotifications(true)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const cartItemCount = getTotalItems()

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault()

    // If we're not on the home page, navigate to home first
    if (pathname !== "/") {
      router.push("/?scrollToProducts=true")
      return
    }

    // Scroll to products section
    const productsSection = document.getElementById("products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-[#222831]/80 border-b border-[#EEEEEE]/10">
        <div className="container relative flex h-16 items-center mx-auto">
          {/* Logo à esquerda */}
          <div className="absolute left-0 flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <Image src="/images/razzosx-logo.png" alt="Razzosx DMA" fill className="object-contain" />
              </div>
              <span className="font-bold text-[#EEEEEE] text-lg">Razzosx DMA</span>
            </Link>
          </div>

          {/* Links centralizados */}
          {!isMobile && (
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-[#00ADB5] ${pathname === "/" ? "text-[#00ADB5]" : "text-[#EEEEEE]"}`}
              >
                Home
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-[#00ADB5] ${pathname === "/dashboard" ? "text-[#00ADB5]" : "text-[#EEEEEE]"}`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          )}

          {/* Ícones à direita */}
          <div className="absolute right-0 flex items-center space-x-4 h-16">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#00ADB5]/10"
                  onClick={toggleCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#00ADB5] text-[#222831] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>

                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#00ADB5]/10"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/orders">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#00ADB5]/10 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {hasNotifications && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ADB5] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ADB5]"></span>
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#00ADB5]/10">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#00ADB5]/10"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#222831]/95 pt-16">
          <nav className="container py-8">
            <ul className="space-y-6">
              <li>
                <Link href="/" className="text-xl font-medium text-[#EEEEEE] hover:text-[#00ADB5]">
                  Home
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link href="/account" className="text-xl font-medium text-[#EEEEEE] hover:text-[#00ADB5]">
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="text-xl font-medium text-[#EEEEEE] hover:text-[#00ADB5]">
                      My Orders
                    </Link>
                  </li>
                </>
              )}
              {isAdmin && (
                <li>
                  <Link href="/dashboard" className="text-xl font-medium text-[#EEEEEE] hover:text-[#00ADB5]">
                    Dashboard
                  </Link>
                </li>
              )}
              {!user && (
                <li>
                  <Link href="/login" className="text-xl font-medium text-[#00ADB5]">
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
