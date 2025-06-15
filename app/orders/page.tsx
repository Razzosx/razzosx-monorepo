"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/hooks/use-currency"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ShoppingBag, Package, Eye, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders")
      return
    }

    fetchOrders()
  }, [user, router])

  const fetchOrders = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          products (id, name, price, image_url),
          shipping_addresses:user_addresses (id, full_name, street, city, state, postal_code, country, email, mobile)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setIsOrderDetailsOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Cancelled</Badge>
      case "processing":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Processing</Badge>
      default:
        return <Badge className="bg-[#EEEEEE]/20 text-[#EEEEEE]/70">{status}</Badge>
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

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10 p-0 mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#EEEEEE]">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <Card className="glass border-[#00ADB5]/20">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <ShoppingBag className="h-24 w-24 text-[#EEEEEE]/30 mb-6" />
              <h2 className="text-2xl font-bold text-[#EEEEEE] mb-4">No orders yet</h2>
              <p className="text-[#EEEEEE]/70 mb-8">You haven't placed any orders yet</p>
              <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                <Link href="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass border-[#00ADB5]/20">
            <CardHeader>
              <CardTitle className="text-[#EEEEEE]">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#EEEEEE]/10">
                      <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Order ID</th>
                      <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Product</th>
                      <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Date</th>
                      <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Amount</th>
                      <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Status</th>
                      <th className="text-right py-3 px-4 text-[#EEEEEE]/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-[#EEEEEE]/10">
                        <td className="py-3 px-4 text-[#EEEEEE] font-mono">{order.id.substring(0, 8)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#393E46] rounded-md flex items-center justify-center mr-3">
                              {order.products?.image_url ? (
                                <img
                                  src={order.products.image_url || "/placeholder.svg"}
                                  alt={order.products.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-[#EEEEEE]/50" />
                              )}
                            </div>
                            <div>
                              <p className="text-[#EEEEEE]">{order.products?.name || "Unknown Product"}</p>
                              <p className="text-[#EEEEEE]/70 text-xs">Qty: {order.quantity}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#EEEEEE]/70">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-[#EEEEEE]">
                          {formatPrice((order.products?.price || 0) * order.quantity)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewOrderDetails(order)}
                            className="h-8 w-8 p-0 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="glass border-[#00ADB5]/20">
          <DialogHeader>
            <DialogTitle className="text-[#EEEEEE]">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Order ID</h3>
                  <p className="text-[#EEEEEE] font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Date</h3>
                  <p className="text-[#EEEEEE]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Status</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Product</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#393E46] rounded-md flex items-center justify-center mr-3">
                    {selectedOrder.products?.image_url ? (
                      <img
                        src={selectedOrder.products.image_url || "/placeholder.svg"}
                        alt={selectedOrder.products.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-[#EEEEEE]/50" />
                    )}
                  </div>
                  <div>
                    <p className="text-[#EEEEEE]">{selectedOrder.products?.name}</p>
                    <p className="text-[#EEEEEE]/70">Qty: {selectedOrder.quantity}</p>
                    <p className="text-[#00ADB5]">
                      {formatPrice((selectedOrder.products?.price || 0) * selectedOrder.quantity)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Shipping Address</h3>
                <p className="text-[#EEEEEE]">{selectedOrder.shipping_addresses?.full_name}</p>
                <p className="text-[#EEEEEE]/70">{selectedOrder.shipping_addresses?.street}</p>
                <p className="text-[#EEEEEE]/70">
                  {selectedOrder.shipping_addresses?.city}, {selectedOrder.shipping_addresses?.state}{" "}
                  {selectedOrder.shipping_addresses?.postal_code}
                </p>
                <p className="text-[#EEEEEE]/70">{selectedOrder.shipping_addresses?.country}</p>
                <p className="text-[#EEEEEE]/70 mt-2">{selectedOrder.shipping_addresses?.email}</p>
                <p className="text-[#EEEEEE]/70">{selectedOrder.shipping_addresses?.mobile}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Payment Method</h3>
                <p className="text-[#EEEEEE]">
                  {selectedOrder.payment_method === "credit_card"
                    ? "Credit Card"
                    : selectedOrder.payment_method === "paypal"
                      ? "PayPal"
                      : selectedOrder.payment_method}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
