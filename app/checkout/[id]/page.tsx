"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useCurrency } from "@/hooks/use-currency"
import { ShoppingBag, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  user_id: string
  product_id: string
  status: string
  payment_method: string | null
  payment_link: string | null
  created_at: string
  products: {
    name: string
    price: number
    image_url: string | null
  }
}

export default function CheckoutOrderPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/checkout/${id}`)
      return
    }

    fetchOrder()
  }, [user, id, router])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          products (
            name,
            price,
            image_url
          )
        `,
        )
        .eq("id", id)
        .single()

      if (error) throw error

      // Check if the order belongs to the current user
      if (data.user_id !== user?.id) {
        throw new Error("Unauthorized")
      }

      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  if (!order) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Card className="glass border-[#00ADB5]/20 p-8">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <ShoppingBag className="h-24 w-24 text-[#EEEEEE]/30 mb-6" />
                <h2 className="text-2xl font-bold text-[#EEEEEE] mb-4">Order not found</h2>
                <p className="text-[#EEEEEE]/70 mb-8">
                  The order you're looking for doesn't exist or you don't have access to it
                </p>
                <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                  <Link href="/orders">View Your Orders</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10 p-0 mb-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#EEEEEE]">Order #{id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass border-[#00ADB5]/20 mb-8">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#EEEEEE]/70">Status:</span>
                  <span className="text-[#EEEEEE] font-medium capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EEEEEE]/70">Date:</span>
                  <span className="text-[#EEEEEE] font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EEEEEE]/70">Payment Method:</span>
                  <span className="text-[#EEEEEE] font-medium capitalize">
                    {order.payment_method || "Not selected"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status === "pending" ? (
                  <div className="space-y-4">
                    <p className="text-[#EEEEEE]/70">Please complete your payment to process your order.</p>
                    <Button className="w-full bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </div>
                ) : order.status === "paid" ? (
                  <p className="text-green-400">Payment completed successfully.</p>
                ) : (
                  <p className="text-red-400">Order has been cancelled.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass border-[#00ADB5]/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[#EEEEEE]">
                    <span>{order.products.name}</span>
                    <span>{formatPrice(order.products.price)}</span>
                  </div>
                </div>

                <div className="border-t border-[#00ADB5]/20 pt-4">
                  <div className="flex justify-between text-[#EEEEEE]">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.products.price)}</span>
                  </div>
                  <div className="flex justify-between text-[#EEEEEE]">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-[#EEEEEE] font-bold text-lg mt-4">
                    <span>Total</span>
                    <span className="text-[#00ADB5]">{formatPrice(order.products.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
