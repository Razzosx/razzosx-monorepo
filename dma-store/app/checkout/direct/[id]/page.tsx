"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingCartIcon as Paypal, Loader2, ArrowLeft } from 'lucide-react'
import { AddressForm } from "@/components/address-form"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Steps, Step } from "@/components/ui/steps"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  zip: string
  country?: string
  full_name?: string
  email?: string
  mobile?: string
  is_default?: boolean
}

export default function DirectCheckoutPage({ params }) {
  const { id } = params
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const [product, setProduct] = useState<Product | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchProductAndAddresses()
  }, [user, id, router])

  const fetchProductAndAddresses = async () => {
    try {
      setIsLoading(true)

      // Fetch product details
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .eq("id", id)
        .eq("active", true)
        .single()

      if (productError) {
        console.error("Product error:", productError)
        throw new Error("Produto não encontrado")
      }

      setProduct(productData)

      // Try to fetch from addresses table first
      let addressData = []
      let addressError = null

      const { data: newAddressData, error: newAddressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)

      if (!newAddressError) {
        addressData = newAddressData
      } else {
        console.error("New address table error:", newAddressError)
        
        // Fallback to user_addresses if addresses table doesn't exist
        const { data: oldAddressData, error: oldAddressError } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)

        if (oldAddressError) {
          console.error("Old address table error:", oldAddressError)
          addressError = oldAddressError
        } else {
          addressData = oldAddressData
        }
      }

      if (addressError) {
        console.error("Address error:", addressError)
        toast({
          title: "Aviso",
          description: "Não foi possível carregar seus endereços. Por favor, adicione um novo endereço.",
          variant: "default",
        })
      }

      setAddresses(addressData || [])
      
      // Set default address if available
      const defaultAddress = addressData?.find(addr => addr.is_default)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id)
      } else if (addressData?.length > 0) {
        setSelectedAddress(addressData[0].id)
      }
    } catch (error) {
      console.error("Fetch product and addresses error:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar produto ou endereços",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product || !user || !selectedAddress || !paymentMethod) return

    setIsProcessing(true)

    try {
      // Create order with selected address and payment method
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_id: product.id,
          address_id: selectedAddress,
          status: "pending",
          payment_method: paymentMethod,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Order error:", error)
        throw new Error("Erro ao criar pedido")
      }

      toast({
        title: "Pedido criado!",
        description: "Redirecionando para pagamento...",
      })

      // Redirect to checkout normal
      router.push(`/checkout/${order.id}`)
    } catch (error) {
      console.error("Buy now error:", error)
      toast({
        title: "Erro",
        description: "Erro ao processar pedido",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADB5] mx-auto"></div>
            <p className="text-[#EEEEEE]/70">Carregando produto e endereços...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#EEEEEE]">Produto não encontrado</h2>
            <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
              <Link href="/">Voltar à loja</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10 p-0 mb-4">
            <Link href={`/produto/${product.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao produto
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#EEEEEE]">Finalizar Compra</h1>
        </div>

        <Steps currentStep={currentStep}>
          <Step title="Selecionar Endereço" />
          <Step title="Escolher Método de Pagamento" />
          <Step title="Confirmar Pedido" />
        </Steps>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Product */}
          <Card className="glass border-[#00ADB5]/20">
            <CardHeader>
              <CardTitle className="text-[#EEEEEE]">Produto Selecionado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=96&width=96&text=Product"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#EEEEEE] text-lg">{product.name}</h3>
                  {product.description && <p className="text-[#EEEEEE]/70 text-sm mt-1">{product.description}</p>}
                  <p className="text-[#00ADB5] font-bold text-xl mt-2">{formatPrice(product.price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Selection */}
          {currentStep === 0 && (
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Selecionar Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-center space-x-4">
                          <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                          <div className="flex-1">
                            <p className="text-[#EEEEEE]">{address.full_name || "Endereço"}</p>
                            <p className="text-[#EEEEEE]/70 text-sm">{address.street}</p>
                            <p className="text-[#EEEEEE]/70 text-sm">{`${address.city}, ${address.state} ${address.zip}`}</p>
                            {address.country && <p className="text-[#EEEEEE]/70 text-sm">{address.country}</p>}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {addresses.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-[#EEEEEE]/70">Nenhum endereço cadastrado</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full bg-[#00ADB5] hover:bg-[#008B94] text-[#222831] py-6 text-lg font-semibold"
                  >
                    Adicionar Novo Endereço
                  </Button>

                  {showAddressForm && (
                    <AddressForm
                      onSubmit={async (newAddress) => {
                        try {
                          const addressToInsert = {
                            ...newAddress,
                            user_id: user.id,
                            is_default: addresses.length === 0 // Set as default if it's the first address
                          }

                          // Try to insert into addresses table first
                          const { data, error } = await supabase
                            .from("addresses")
                            .insert(addressToInsert)
                            .select("id")
                            .single()

                          if (error) {
                            console.error("Error adding to addresses:", error)
                            
                            // Fallback to user_addresses if addresses table doesn't exist
                            const { data: oldData, error: oldError } = await supabase
                              .from("user_addresses")
                              .insert(addressToInsert)
                              .select("id")
                              .single()
                              
                            if (oldError) {
                              console.error("Error adding to user_addresses:", oldError)
                              throw new Error("Não foi possível adicionar o endereço")
                            } else {
                              // Refresh addresses from user_addresses
                              const { data: refreshedAddresses } = await supabase
                                .from("user_addresses")
                                .select("*")
                                .eq("user_id", user.id)

                              setAddresses(refreshedAddresses || [])
                              setSelectedAddress(oldData.id)
                            }
                          } else {
                            // Refresh addresses from addresses table
                            const { data: refreshedAddresses } = await supabase
                              .from("addresses")
                              .select("*")
                              .eq("user_id", user.id)

                            setAddresses(refreshedAddresses || [])
                            setSelectedAddress(data.id)
                          }
                          
                          setShowAddressForm(false)
                          toast({
                            title: "Endereço adicionado",
                            description: "Seu novo endereço foi adicionado com sucesso",
                          })
                        } catch (error) {
                          console.error("Error adding address:", error)
                          toast({
                            title: "Erro",
                            description: "Ocorreu um erro ao adicionar o endereço",
                            variant: "destructive",
                          })
                        }
                      }}
                      onCancel={() => setShowAddressForm(false)}
                    />
                  )}

                  <Button
                    onClick={() => setCurrentStep(1)}
                    className="w-full bg-[#00ADB5] hover:bg-[#008B94] text-[#222831] py-6 text-lg font-semibold"
                    disabled={!selectedAddress && addresses.length > 0}
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          {currentStep === 1 && (
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Escolher Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="credit_card" id="payment-credit-card" />
                      <label htmlFor="payment-credit-card" className="text-[#EEEEEE] cursor-pointer">
                        Cartão de Crédito
                      </label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="bitcoin" id="payment-bitcoin" />
                      <label htmlFor="payment-bitcoin" className="text-[#EEEEEE] cursor-pointer">
                        Bitcoin
                      </label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="paypal" id="payment-paypal" />
                      <label htmlFor="payment-paypal" className="text-[#EEEEEE] cursor-pointer">
                        PayPal
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setCurrentStep(0)}
                    variant="outline"
                    className="w-full border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5]/10"
                  >
                    Voltar
                  </Button>

                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-[#00ADB5] hover:bg-[#008B94] text-[#222831] py-6 text-lg font-semibold"
                    disabled={!paymentMethod}
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Confirmation */}
          {currentStep === 2 && (
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[#EEEEEE]">
                    <span>Produto:</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-[#EEEEEE]">
                    <span>Endereço:</span>
                    <span>
                      {addresses.find((address) => address.id === selectedAddress)?.street || "Endereço selecionado"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#EEEEEE]">
                    <span>Método de Pagamento:</span>
                    <span>
                      {paymentMethod === "credit_card"
                        ? "Cartão de Crédito"
                        : paymentMethod === "bitcoin"
                          ? "Bitcoin"
                          : "PayPal"}
                    </span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-xl font-bold text-[#EEEEEE]">
                    <span>Total:</span>
                    <span className="text-[#00ADB5]">{formatPrice(product.price)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="w-full border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5]/10"
                  >
                    Voltar
                  </Button>

                  <Button
                    onClick={handleBuyNow}
                    className="w-full bg-[#00ADB5] hover:bg-[#008B94] text-[#222831] py-6 text-lg font-semibold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Paypal className="h-5 w-5 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-[#EEEEEE]/60">
                      Ao continuar, você será redirecionado para a página de pagamento seguro
                    </p>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-[#00ADB5]/10 rounded-lg p-4 flex items-center space-x-3">
                  <div className="bg-[#00ADB5]/20 rounded-full p-2">
                    <Paypal className="h-5 w-5 text-[#00ADB5]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#EEEEEE]">Compra Segura</p>
                    <p className="text-xs text-[#EEEEEE]/70">Seus dados estão protegidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
