"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Copy, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useCurrency } from "@/hooks/use-currency"
import { useToast } from "@/hooks/use-toast"

export default function CryptoPaymentPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<string>("pending")
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*, products(*)")
          .eq("id", id)
          .single()

        if (orderError) throw orderError
        if (!orderData) throw new Error("Order not found")

        setOrder(orderData)

        // If payment is already initiated, fetch its status
        if (orderData.payment_id) {
          setPaymentData({
            paymentId: orderData.payment_id,
            payAddress: orderData.payment_details?.payAddress,
            payAmount: orderData.payment_details?.payAmount,
            cryptoCurrency: orderData.payment_details?.cryptoCurrency || "btc",
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderData.payment_details?.payAddress}`,
          })
          setPaymentStatus(orderData.payment_status || "pending")
        } else {
          // Create new crypto payment
          await createCryptoPayment(orderData)
        }
      } catch (err: any) {
        console.error("Error fetching order:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id])

  // Poll for payment status updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (paymentData && paymentStatus === "pending") {
      interval = setInterval(checkPaymentStatus, 30000) // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [paymentData, paymentStatus])

  const createCryptoPayment = async (orderData: any) => {
    try {
      setLoading(true)

      const response = await fetch("/api/payments/nowpayments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: id,
          amount: orderData.products.price * (orderData.quantity || 1),
          currency: "USD",
          cryptoCurrency: "btc", // Default to BTC, can be expanded to support more currencies
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create payment")
      }

      setPaymentData(result)
      setPaymentStatus(result.status)
    } catch (err: any) {
      console.error("Error creating crypto payment:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentData?.paymentId || checkingStatus) return

    try {
      setCheckingStatus(true)

      // Check payment status from our backend
      const { data, error } = await supabase
        .from("orders")
        .select("payment_status, payment_details")
        .eq("id", id)
        .single()

      if (error) throw error

      if (data.payment_status !== paymentStatus) {
        setPaymentStatus(data.payment_status)

        // If payment is confirmed, show success message
        if (data.payment_status === "confirmed" || data.payment_status === "finished") {
          toast({
            title: "Payment confirmed!",
            description: "Your order has been processed successfully.",
            variant: "success",
          })

          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push(`/checkout/success?order=${id}`)
          }, 3000)
        }
      }
    } catch (err) {
      console.error("Error checking payment status:", err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      variant: "success",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#00ADB5] mb-4" />
            <p className="text-[#EEEEEE]">Preparing your crypto payment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="glass border-[#00ADB5]/20">
            <CardHeader>
              <CardTitle className="text-[#EEEEEE]">Payment Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-red-400 mb-6">{error}</p>
                <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                  <Link href="/checkout">Return to Checkout</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10 p-0 mb-4">
          <Link href="/checkout">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </Link>
        </Button>

        <Card className="glass border-[#00ADB5]/20">
          <CardHeader>
            <CardTitle className="text-[#EEEEEE]">Crypto Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStatus === "confirmed" || paymentStatus === "finished" ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-green-500/20 p-4 mb-6">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#EEEEEE] mb-2">Payment Confirmed!</h2>
                <p className="text-[#EEEEEE]/70 mb-6 text-center">
                  Your payment has been confirmed and your order is being processed.
                </p>
                <div className="flex space-x-4">
                  <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                    <Link href={`/orders`}>View Your Orders</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-full max-w-md">
                  <div className="bg-[#222831] p-6 rounded-lg mb-6">
                    <div className="flex flex-col items-center mb-6">
                      <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">
                        Pay with {paymentData?.cryptoCurrency?.toUpperCase() || "BTC"}
                      </h3>
                      <p className="text-[#EEEEEE]/70 text-center mb-4">
                        Send exactly the amount below to complete your purchase
                      </p>

                      <div className="bg-white p-4 rounded-lg mb-4">
                        {paymentData?.qrCodeUrl && (
                          <img
                            src={paymentData.qrCodeUrl || "/placeholder.svg"}
                            alt="Payment QR Code"
                            className="w-48 h-48 mx-auto"
                          />
                        )}
                      </div>

                      <div className="w-full space-y-4">
                        <div className="bg-[#393E46] p-3 rounded flex justify-between items-center">
                          <div>
                            <p className="text-xs text-[#EEEEEE]/50">Amount</p>
                            <p className="text-[#EEEEEE] font-mono">
                              {paymentData?.payAmount} {paymentData?.cryptoCurrency?.toUpperCase()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#00ADB5] hover:bg-[#00ADB5]/10"
                            onClick={() => copyToClipboard(paymentData?.payAmount?.toString() || "", "Amount")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="bg-[#393E46] p-3 rounded flex justify-between items-center">
                          <div className="max-w-[80%]">
                            <p className="text-xs text-[#EEEEEE]/50">Address</p>
                            <p className="text-[#EEEEEE] font-mono text-sm truncate">{paymentData?.payAddress}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#00ADB5] hover:bg-[#00ADB5]/10"
                            onClick={() => copyToClipboard(paymentData?.payAddress || "", "Address")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#EEEEEE]/10 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#EEEEEE]/70">Status:</span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-500">
                          {paymentStatus === "waiting" ? "Waiting for payment" : "Pending confirmation"}
                        </span>
                      </div>
                      <p className="text-[#EEEEEE]/50 text-sm text-center mt-4">
                        The page will automatically update when your payment is confirmed. Please do not close this
                        window.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#222831] p-4 rounded-lg">
                    <h4 className="text-[#EEEEEE] font-medium mb-2">Order Summary</h4>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EEEEEE]/70">{order?.products?.name}</span>
                      <span className="text-[#EEEEEE]">
                        {formatPrice(order?.products?.price * (order?.quantity || 1))}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#EEEEEE]/70">Quantity</span>
                      <span className="text-[#EEEEEE]">{order?.quantity || 1}</span>
                    </div>
                    <div className="border-t border-[#EEEEEE]/10 mt-2 pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-[#EEEEEE]">Total</span>
                        <span className="text-[#00ADB5]">
                          {formatPrice(order?.products?.price * (order?.quantity || 1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={checkPaymentStatus}
                      disabled={checkingStatus}
                      variant="outline"
                      className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                    >
                      {checkingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking status...
                        </>
                      ) : (
                        "Check payment status"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
