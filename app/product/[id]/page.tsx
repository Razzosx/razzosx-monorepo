"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Shield, CreditCard, ArrowLeft, Check, Truck, Globe, ShoppingCart } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { useCurrency } from "@/hooks/use-currency"
import { ProductFeedback } from "@/components/product-feedback"
import { useCart } from "@/hooks/use-cart"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  created_at: string
  active: boolean
  is_best_seller: boolean
  product_type: string
  is_limited: boolean
  current_stock: number
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("active", true)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error("Error loading product:", error)
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login")
      return
    }
    if (product) {
      addToCart(product.id)
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart",
      })
    }
  }

  const handleBuyNow = () => {
    if (!user) {
      router.push("/login")
      return
    }
    if (product) {
      addToCart(product.id)
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart",
      })
      router.push("/checkout")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222831]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADB5]"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#222831]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#EEEEEE] mb-4">Product not found</h2>
            <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
              <Link href="/">Back to Store</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-[#00ADB5] hover:bg-[#00ADB5]/10 p-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[#393E46]">
              <Image
                src={product.image_url || "/placeholder.svg?height=600&width=600&text=Product"}
                alt={product.name}
                fill
                className="object-cover"
              />

              {/* Badges organized as in the example image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-[#00ADB5] text-[#EEEEEE] hover:bg-[#008B94]">
                  {product.product_type === "digital" ? "Digital" : "Physical"}
                </Badge>

                {product.is_best_seller && (
                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-[#EEEEEE]">Best Seller</Badge>
                )}
              </div>

              {product.is_limited && (
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-[#EEEEEE]">
                    Limited Edition
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Information - Cleaner layout */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#EEEEEE] mb-2">{product.name}</h1>

              {product.description && <p className="text-[#EEEEEE]/70 mb-4">{product.description}</p>}

              {product.is_limited && product.current_stock && (
                <p className="text-[#EEEEEE]/70 text-sm mb-4">{product.current_stock}</p>
              )}

              <p className="text-4xl font-bold text-[#00ADB5] mb-6">{formatPrice(product.price)}</p>
            </div>

            {/* Shipping Information - Simplified */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-[#00ADB5]" />
                <span className="text-[#EEEEEE]/80">Fast Shipping (6-12 days)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-[#00ADB5]" />
                <span className="text-[#EEEEEE]/80">Worldwide Delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-[#00ADB5]" />
                <span className="text-[#EEEEEE]/80">Tracking Number Provided</span>
              </div>
            </div>

            <Separator className="bg-[#00ADB5]/20" />

            {/* Action Buttons - Cleaner layout */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10 h-12"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Add to Cart
              </Button>

              <Button onClick={handleBuyNow} className="w-full bg-[#00ADB5] hover:bg-[#008B94] text-[#222831] h-12">
                <CreditCard className="h-5 w-5 mr-3" />
                Buy Now
              </Button>
            </div>

            {/* Guarantees */}
            <Card className="bg-[#393E46] border-[#00ADB5]/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-[#00ADB5]" />
                  <div>
                    <h4 className="font-semibold text-[#EEEEEE]">Secure Purchase</h4>
                    <p className="text-sm text-[#EEEEEE]/70">Your data is protected and encrypted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-16">
          <ProductFeedback productId={product.id} />
        </div>
      </div>
    </div>
  )
}
