"use client"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { useCurrency } from "@/hooks/use-currency"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import useMobile from "@/hooks/use-mobile"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()
  const { formatPrice } = useCurrency()
  const isMobile = useMobile()
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        className={`glass border-l border-[#00ADB5]/20 w-full max-w-md flex flex-col transition-transform duration-300 ease-in-out ${
          isClosing ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00ADB5]/20">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-[#00ADB5]" />
            <h2 className="text-xl font-bold text-[#EEEEEE]">Your Cart</h2>
            <span className="bg-[#00ADB5] text-[#222831] text-xs font-bold rounded-full px-2 py-1">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-[#EEEEEE] hover:bg-[#00ADB5]/10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-[#EEEEEE]/30 mb-4" />
              <h3 className="text-xl font-medium text-[#EEEEEE] mb-2">Your cart is empty</h3>
              <p className="text-[#EEEEEE]/70 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Button
                asChild
                className="bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE]"
              >
                <Link href="/" onClick={handleClose}>
                  Start Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-[#393E46]">
                    {item.products.image_url ? (
                      <Image
                        src={item.products.image_url || "/placeholder.svg"}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 80px) 100vw, 80px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-[#393E46]">
                        <ShoppingCart className="h-8 w-8 text-[#EEEEEE]/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-[#EEEEEE] line-clamp-1">{item.products.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-6 w-6 text-[#EEEEEE]/70 hover:text-red-400 hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                    <div className="text-[#00ADB5] font-medium">{formatPrice(item.products.price)}</div>

                    {/* Quantity Controls */}
                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="h-7 w-7 rounded-full border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Decrease quantity</span>
                      </Button>
                      <span className="mx-3 text-[#EEEEEE] tabular-nums">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-full border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Increase quantity</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-[#EEEEEE]/70 hover:text-red-400 hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#00ADB5]/20">
            <div className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-[#EEEEEE]/70">Subtotal</span>
                <span className="text-[#EEEEEE] font-medium">{formatPrice(subtotal)}</span>
              </div>

              {/* Shipping - placeholder */}
              <div className="flex justify-between items-center">
                <span className="text-[#EEEEEE]/70">Shipping</span>
                <span className="text-[#EEEEEE] font-medium">Calculated at checkout</span>
              </div>

              <Separator className="bg-[#00ADB5]/20" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-[#EEEEEE]">Total</span>
                <span className="text-lg font-bold text-[#00ADB5]">{formatPrice(subtotal)}</span>
              </div>

              {/* Checkout Button */}
              <Button
                asChild
                className="w-full bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE]"
              >
                <Link href="/checkout" onClick={handleClose}>
                  Proceed to Checkout
                </Link>
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outline"
                asChild
                className="w-full border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
              >
                <Link href="/" onClick={handleClose}>
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
