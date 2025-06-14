"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/hooks/use-currency"
import { useMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import Image from "next/image"
import { Truck, Globe, Shield, Star, Sparkles, Package, CheckCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  created_at: string
  active: boolean
  is_best_seller: boolean
  product_type: string
  is_limited: boolean
  current_stock: number | null
  redirect_url?: string | null
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrency()
  const isMobile = useMobile()
  const productsSectionRef = useRef<HTMLElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Check if we should scroll to products section
    if (searchParams.get("scrollToProducts") === "true") {
      setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 500)
    }
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Retry logic for better connection handling
      let retries = 3
      let data = null

      while (retries > 0) {
        try {
          const { data: productsData, error } = await supabase
            .from("products")
            .select("*")
            .eq("active", true)
            .order("is_best_seller", { ascending: false })
            .order("created_at", { ascending: false })

          if (error) throw error
          data = productsData
          break
        } catch (error) {
          retries--
          if (retries === 0) throw error
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([]) // Set empty array to prevent infinite loading
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="slide-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-[#EEEEEE] mb-6">Razzosx DMA</h1>
            <p className="text-xl md:text-2xl text-[#EEEEEE]/80 mb-4">Reliable and Quality Products</p>
            <p className="text-lg text-[#EEEEEE]/60 max-w-3xl mx-auto mb-12">
              Discover our exclusive selection of premium products with worldwide shipping.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass rounded-2xl p-6 hover-lift slide-in-left">
              <Truck className="h-12 w-12 text-[#00ADB5] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#EEEEEE] mb-2">Fast Shipping</h3>
              <p className="text-[#EEEEEE]/70">Get your physical products in 6-12 business days</p>
            </div>
            <div className="glass rounded-2xl p-6 hover-lift slide-in-up" style={{ animationDelay: "0.2s" }}>
              <Globe className="h-12 w-12 text-[#00ADB5] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#EEEEEE] mb-2">Worldwide Delivery</h3>
              <p className="text-[#EEEEEE]/70">We ship to over 100 countries around the world</p>
            </div>
            <div className="glass rounded-2xl p-6 hover-lift slide-in-right" style={{ animationDelay: "0.4s" }}>
              <Shield className="h-12 w-12 text-[#00ADB5] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#EEEEEE] mb-2">Secure Payment</h3>
              <p className="text-[#EEEEEE]/70">Multiple payment methods with bank-level security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" ref={productsSectionRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 slide-in-up">
            <h2 className="text-4xl font-bold text-[#EEEEEE] mb-4 flex items-center justify-center">
              <Package className="h-10 w-10 mr-3 text-[#00ADB5]" />
              Our Products
            </h2>
            <p className="text-xl text-[#EEEEEE]/70 max-w-2xl mx-auto">
              Discover our premium selection of digital marketing automation tools and services
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADB5]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-24 w-24 text-[#EEEEEE]/30 mx-auto mb-6" />
              <p className="text-xl text-[#EEEEEE]/70">No products available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  className="glass border-[#00ADB5]/20 hover:border-[#00ADB5]/40 transition-all duration-300 hover-lift slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=300&width=400&text=Product"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <Badge className="bg-[#00ADB5] text-[#EEEEEE] hover:bg-[#008B94]">
                          {product.product_type === "digital" ? "Digital" : "Physical"}
                        </Badge>

                        {product.is_best_seller && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#222831]">
                            <Star className="h-3 w-3 mr-1" />
                            Best Seller
                          </Badge>
                        )}

                        {product.is_limited && (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-[#EEEEEE]">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Limited Edition
                          </Badge>
                        )}
                      </div>

                      {/* Stock indicator for limited products */}
                      {product.is_limited && product.current_stock !== null && (
                        <div className="absolute bottom-4 right-4">
                          <Badge
                            className={`${
                              product.current_stock > 10
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : product.current_stock > 0
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                          >
                            {product.current_stock > 0 ? `${product.current_stock} in stock` : "Out of Stock"}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-[#EEEEEE] mb-2 line-clamp-2">{product.name}</h3>
                      {product.description && (
                        <p className="text-[#EEEEEE]/70 mb-4 line-clamp-3">{product.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#00ADB5]">
                          {formatPrice(product.price)}
                        </div>
                        {product.redirect_url ? (
                          <a
                            href={product.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 rounded bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE] font-medium transition"
                          >
                            View Details
                          </a>
                        ) : (
                          <Link
                            href={`/product/${product.id}`}
                            className="inline-block px-4 py-2 rounded bg-gradient-to-r from-[#00ADB5] to-[#008B94] hover:from-[#008B94] hover:to-[#006B73] text-[#EEEEEE] font-medium transition"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#393E46]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center slide-in-left">
              <div className="w-16 h-16 bg-[#00ADB5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#00ADB5]" />
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">Quality Products</h3>
              <p className="text-[#EEEEEE]/70">All our products are thoroughly tested and verified</p>
            </div>

            <div className="text-center slide-in-left" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-[#00ADB5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-[#00ADB5]" />
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">Free EU Shipping</h3>
              <p className="text-[#EEEEEE]/70">Free shipping on all orders within the European Union</p>
            </div>

            <div className="text-center slide-in-right" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-[#00ADB5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#00ADB5]" />
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">Secure Payment</h3>
              <p className="text-[#EEEEEE]/70">Multiple payment methods with bank-level security</p>
            </div>

            <div className="text-center slide-in-right" style={{ animationDelay: "0.3s" }}>
              <div className="w-16 h-16 bg-[#00ADB5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-[#00ADB5]" />
              </div>
              <h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">Fast Shipping</h3>
              <p className="text-[#EEEEEE]/70">Get your physical products in 6-12 business days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#222831]/50 border-t border-[#00ADB5]/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 relative mr-4">
              <Image src="/images/razzosx-logo.png" alt="Razzosx DMA" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#EEEEEE]">Razzosx DMA</h3>
            </div>
          </div>
          <p className="text-[#EEEEEE]/70 max-w-2xl mx-auto">
            Razzosx DMA provides premium digital marketing automation tools and services with secure payment options and
            worldwide delivery.
          </p>
        </div>
      </footer>
    </div>
  )
}
