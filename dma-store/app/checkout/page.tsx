"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useCurrency } from "@/hooks/use-currency"
import { ShoppingBag, ArrowLeft, CreditCard, Truck, CheckCircle, Loader2, MapPin, Bitcoin } from "lucide-react"
import { Steps } from "@/components/ui/steps"
import { AddressForm } from "@/components/address-form"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { items, loading: cartLoading, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { formatPrice } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [shippingAddress, setShippingAddress] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout")
      return
    }

    // Load user's saved addresses
    const fetchAddresses = async () => {
      try {
        const { data, error } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })

        if (error) throw error

        setSavedAddresses(data || [])

        // If there's a default address, select it automatically
        const defaultAddress = data?.find((addr) => addr.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setShippingAddress(defaultAddress)
        }
      } catch (error) {
        console.error("Error fetching addresses:", error)
      }
    }

    fetchAddresses()
    setLoading(false)
  }, [user, router])

  const handleAddressValidated = (address: any, isValid: boolean) => {
    if (isValid) {
      setShippingAddress(address)
      setCurrentStep(1)
    }
  }

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method)
  }

  const handleProceedToReview = () => {
    if (paymentMethod) {
      setCurrentStep(2)
    }
  }

  const handleSelectAddress = (addressId: string) => {
    if (addressId === "new") {
      setShowNewAddressForm(true)
      setSelectedAddressId(null)
      setShippingAddress(null)
    } else {
      const selectedAddress = savedAddresses.find((addr) => addr.id === addressId)
      if (selectedAddress) {
        setShippingAddress(selectedAddress)
        setSelectedAddressId(addressId)
        setShowNewAddressForm(false)
      }
    }
  }

  const handleContinueWithAddress = () => {
    if (shippingAddress) {
      setCurrentStep(1)
    }
  }

  const handlePlaceOrder = async () => {
    if (!user || !shippingAddress || !paymentMethod) return

    setProcessingOrder(true)

    try {
      // Save shipping address if it doesn't exist yet
      let addressId = null
      if (selectedAddressId) {
        addressId = selectedAddressId
      } else if (!shippingAddress.id) {
        const { data: addressData, error: addressError } = await supabase
          .from("user_addresses")
          .insert({
            user_id: user.id,
            full_name: shippingAddress.full_name,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
            email: shippingAddress.email,
            mobile: shippingAddress.mobile,
            is_default: shippingAddress.is_default,
          })
          .select()

        if (addressError) throw addressError
        addressId = addressData?.[0]?.id
      } else {
        addressId = shippingAddress.id
      }

      // Create order for each item in cart
      const orderPromises = items.map(async (item) => {
        const { data, error } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
            status: "pending",
            payment_method: paymentMethod,
            shipping_address_id: addressId,
          })
          .select()

        if (error) throw error
        return data?.[0]
      })

      const orders = await Promise.all(orderPromises)
      const firstOrder = orders[0]
      setOrderId(firstOrder?.id || null)

      // For crypto payments, redirect to the crypto payment page
      if (paymentMethod === "crypto" && firstOrder?.id) {
        router.push(`/checkout/crypto-payment/${firstOrder.id}`)
        return
      }

      // For other payment methods, continue with the normal flow
      setOrderComplete(true)
      setCurrentStep(3)

      // Clear cart after successful order
      clearCart()
    } catch (error) {
      console.error("Error placing order:", error)
    } finally {
      setProcessingOrder(false)
    }
  }

  if (loading || cartLoading) {
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

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Card className="glass border-[#00ADB5]/20 p-8">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <ShoppingBag className="h-24 w-24 text-[#EEEEEE]/30 mb-6" />
                <h2 className="text-2xl font-bold text-[#EEEEEE] mb-4">Your cart is empty</h2>
                <p className="text-[#EEEEEE]/70 mb-8">Add some products to your cart to proceed with checkout</p>
                <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                  <Link href="/">Browse Products</Link>
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
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#EEEEEE]">Checkout</h1>
        </div>

        {/* Checkout Steps */}
        <div className="mb-8">
          <Steps
            steps={[
              { label: "Shipping", icon: <Truck className="h-5 w-5" /> },
              { label: "Payment", icon: <CreditCard className="h-5 w-5" /> },
              { label: "Review", icon: <ShoppingBag className="h-5 w-5" /> },
              { label: "Complete", icon: <CheckCircle className="h-5 w-5" /> },
            ]}
            currentStep={currentStep}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 0 && (
              <Card className="glass border-[#00ADB5]/20 mb-8">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE]">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <MapPin className="h-5 w-5 text-[#00ADB5] mr-2" />
                        <h3 className="text-lg font-medium text-[#EEEEEE]">Select a saved address</h3>
                      </div>

                      <Select value={selectedAddressId || ""} onValueChange={handleSelectAddress}>
                        <SelectTrigger className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE] mb-4">
                          <SelectValue placeholder="Select an address" />
                        </SelectTrigger>
                        <SelectContent className="glass border-[#00ADB5]/20">
                          {savedAddresses.map((address) => (
                            <SelectItem
                              key={address.id}
                              value={address.id}
                              className="text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                            >
                              {address.full_name} - {address.street}, {address.city}, {address.country}
                              {address.is_default && " (Default)"}
                            </SelectItem>
                          ))}
                          <SelectItem value="new" className="text-[#00ADB5] hover:bg-[#00ADB5]/10">
                            + Add new address
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {selectedAddressId && !showNewAddressForm && (
                        <div className="bg-[#222831] p-4 rounded-lg mb-4">
                          <p className="text-[#EEEEEE] font-medium">{shippingAddress.full_name}</p>
                          <p className="text-[#EEEEEE]/70">{shippingAddress.street}</p>
                          <p className="text-[#EEEEEE]/70">
                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                          </p>
                          <p className="text-[#EEEEEE]/70">{shippingAddress.country}</p>
                          <p className="text-[#EEEEEE]/70 mt-2">{shippingAddress.email}</p>
                          <p className="text-[#EEEEEE]/70">{shippingAddress.mobile}</p>

                          <div className="flex justify-between mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowNewAddressForm(true)}
                              className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                            >
                              Use a different address
                            </Button>
                            <Button
                              onClick={handleContinueWithAddress}
                              className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]"
                            >
                              Continue with this address
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(showNewAddressForm || savedAddresses.length === 0) && (
                    <>
                      {savedAddresses.length > 0 && (
                        <div className="mb-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowNewAddressForm(false)
                              if (savedAddresses.length > 0) {
                                const defaultAddress =
                                  savedAddresses.find((addr) => addr.is_default) || savedAddresses[0]
                                setSelectedAddressId(defaultAddress.id)
                                setShippingAddress(defaultAddress)
                              }
                            }}
                            className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to saved addresses
                          </Button>
                        </div>
                      )}
                      <AddressForm onAddressValidated={handleAddressValidated} />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 1 && (
              <Card className="glass border-[#00ADB5]/20">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE]">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "credit_card"
                            ? "border-[#00ADB5] bg-[#00ADB5]/10"
                            : "border-[#EEEEEE]/20 hover:border-[#00ADB5]/50"
                        }`}
                        onClick={() => handleSelectPaymentMethod("credit_card")}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-6 w-6 text-[#EEEEEE]" />
                          <div>
                            <h3 className="font-medium text-[#EEEEEE]">Credit Card</h3>
                            <p className="text-sm text-[#EEEEEE]/70">Pay with Visa, Mastercard, etc.</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "paypal"
                            ? "border-[#00ADB5] bg-[#00ADB5]/10"
                            : "border-[#EEEEEE]/20 hover:border-[#00ADB5]/50"
                        }`}
                        onClick={() => handleSelectPaymentMethod("paypal")}
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="h-6 w-6 text-[#EEEEEE]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.64.64 0 0 1 .632-.537h6.012c2.071 0 3.728.51 4.91 1.519 1.15.976 1.73 2.309 1.73 3.965 0 .772-.146 1.53-.425 2.251a6.64 6.64 0 0 1-1.142 1.794c-.5.539-1.064.974-1.687 1.295a7.165 7.165 0 0 1-1.931.658 9.063 9.063 0 0 1-1.96.211H8.512a.638.638 0 0 0-.63.533l-1.38 6.264a.638.638 0 0 1-.63.533h-.796v-.17z" />
                            <path
                              d="M19.261 7.666c0 .772-.146 1.53-.425 2.251h-4.583a.638.638 0 0 0-.63.533l-1.38 6.265a.638.638 0 0 1-.63.533h-4.573l1.38-6.264a.638.638 0 0 1 .63-.533h2.976c.293 0 .569-.008.84-.026.271-.018.58-.063.926-.135.345-.072.661-.17.946-.294.285-.124.58-.294.886-.51.305-.216.56-.463.765-.74.205-.278.395-.624.57-1.04.175-.415.312-.87.412-1.366.1-.495.15-1.05.15-1.674 0-1.656-.58-2.989-1.73-3.965 1.15.976 1.73 2.309 1.73 3.965z"
                              fillOpacity=".3"
                            />
                          </svg>
                          <div>
                            <h3 className="font-medium text-[#EEEEEE]">PayPal</h3>
                            <p className="text-sm text-[#EEEEEE]/70">Pay with your PayPal account</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "crypto"
                            ? "border-[#00ADB5] bg-[#00ADB5]/10"
                            : "border-[#EEEEEE]/20 hover:border-[#00ADB5]/50"
                        }`}
                        onClick={() => handleSelectPaymentMethod("crypto")}
                      >
                        <div className="flex items-center space-x-3">
                          <Bitcoin className="h-6 w-6 text-[#EEEEEE]" />
                          <div>
                            <h3 className="font-medium text-[#EEEEEE]">Crypto</h3>
                            <p className="text-sm text-[#EEEEEE]/70">Pay with cryptocurrency</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={() => setCurrentStep(0)}
                        variant="outline"
                        className="mr-2 border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleProceedToReview}
                        disabled={!paymentMethod}
                        className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]"
                      >
                        Continue to Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 2 && (
              <Card className="glass border-[#00ADB5]/20">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE]">Review Your Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">Shipping Address</h3>
                      <div className="bg-[#222831] p-4 rounded-lg">
                        <p className="text-[#EEEEEE]">{shippingAddress.full_name}</p>
                        <p className="text-[#EEEEEE]/70">{shippingAddress.street}</p>
                        <p className="text-[#EEEEEE]/70">
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                        </p>
                        <p className="text-[#EEEEEE]/70">{shippingAddress.country}</p>
                        <p className="text-[#EEEEEE]/70 mt-2">{shippingAddress.email}</p>
                        <p className="text-[#EEEEEE]/70">{shippingAddress.mobile}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">Payment Method</h3>
                      <div className="bg-[#222831] p-4 rounded-lg flex items-center">
                        {paymentMethod === "credit_card" ? (
                          <>
                            <CreditCard className="h-5 w-5 text-[#00ADB5] mr-2" />
                            <span className="text-[#EEEEEE]">Credit Card</span>
                          </>
                        ) : paymentMethod === "paypal" ? (
                          <>
                            <svg className="h-5 w-5 text-[#00ADB5] mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.64.64 0 0 1 .632-.537h6.012c2.071 0 3.728.51 4.91 1.519 1.15.976 1.73 2.309 1.73 3.965 0 .772-.146 1.53-.425 2.251a6.64 6.64 0 0 1-1.142 1.794c-.5.539-1.064.974-1.687 1.295a7.165 7.165 0 0 1-1.931.658 9.063 9.063 0 0 1-1.96.211H8.512a.638.638 0 0 0-.63.533l-1.38 6.264a.638.638 0 0 1-.63.533h-.796v-.17z" />
                              <path
                                d="M19.261 7.666c0 .772-.146 1.53-.425 2.251h-4.583a.638.638 0 0 0-.63.533l-1.38 6.265a.638.638 0 0 1-.63.533h-4.573l1.38-6.264a.638.638 0 0 1 .63-.533h2.976c.293 0 .569-.008.84-.026.271-.018.58-.063.926-.135.345-.072.661-.17.946-.294.285-.124.58-.294.886-.51.305-.216.56-.463.765-.74.205-.278.395-.624.57-1.04.175-.415.312-.87.412-1.366.1-.495.15-1.05.15-1.674 0-1.656-.58-2.989-1.73-3.965 1.15.976 1.73 2.309 1.73 3.965z"
                                fillOpacity=".3"
                              />
                            </svg>
                            <span className="text-[#EEEEEE]">PayPal</span>
                          </>
                        ) : (
                          <>
                            <Bitcoin className="h-5 w-5 text-[#00ADB5] mr-2" />
                            <span className="text-[#EEEEEE]">Crypto</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">Order Items</h3>
                      <div className="bg-[#222831] p-4 rounded-lg">
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#393E46] rounded-md flex items-center justify-center mr-3">
                                  {item.products.image_url ? (
                                    <img
                                      src={item.products.image_url || "/placeholder.svg"}
                                      alt={item.products.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ) : (
                                    <ShoppingBag className="h-6 w-6 text-[#EEEEEE]/50" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-[#EEEEEE]">{item.products.name}</p>
                                  <p className="text-[#EEEEEE]/70 text-sm">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-[#EEEEEE]">{formatPrice(item.products.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={processingOrder}
                        className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]"
                      >
                        {processingOrder ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Order Complete */}
            {currentStep === 3 && (
              <Card className="glass border-[#00ADB5]/20">
                <CardHeader>
                  <CardTitle className="text-[#EEEEEE]">Order Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-[#00ADB5]/20 p-4 mb-6">
                      <CheckCircle className="h-12 w-12 text-[#00ADB5]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#EEEEEE] mb-2">Thank you for your order!</h2>
                    <p className="text-[#EEEEEE]/70 mb-6 text-center">
                      Your order has been placed successfully. We'll send you a confirmation email shortly.
                    </p>
                    {orderId && (
                      <p className="text-[#EEEEEE] mb-6">
                        Order ID: <span className="font-mono bg-[#222831] px-2 py-1 rounded">{orderId}</span>
                      </p>
                    )}
                    <div className="flex space-x-4">
                      <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                        <Link href="/">Continue Shopping</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                      >
                        <Link href="/orders">View Orders</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="glass border-[#00ADB5]/20 sticky top-8">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#EEEEEE]/70">Items ({getTotalItems()})</span>
                    <span className="text-[#EEEEEE]">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EEEEEE]/70">Shipping</span>
                    <span className="text-[#EEEEEE]">{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EEEEEE]/70">Tax</span>
                    <span className="text-[#EEEEEE]">{formatPrice(getTotalPrice() * 0.1)}</span>
                  </div>
                  <div className="border-t border-[#EEEEEE]/10 pt-4 mt-4">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#EEEEEE]">Total</span>
                      <span className="text-[#00ADB5]">{formatPrice(getTotalPrice() * 1.1)}</span>
                    </div>
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
