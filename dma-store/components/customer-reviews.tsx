"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import Image from "next/image"

interface Review {
  id: number
  name: string
  avatar: string
  rating: number
  text: string
}

const reviews: Review[] = [
  {
    id: 1,
    name: "John D.",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
    rating: 5,
    text: "Excellent products and fast shipping. The customer service was outstanding when I had questions about my order.",
  },
  {
    id: 2,
    name: "Sarah M.",
    avatar: "/placeholder.svg?height=100&width=100&text=SM",
    rating: 5,
    text: "I've been using their digital marketing tools for months now and have seen significant improvements in my campaigns.",
  },
  {
    id: 3,
    name: "Michael R.",
    avatar: "/placeholder.svg?height=100&width=100&text=MR",
    rating: 4,
    text: "Great value for the price. The product quality exceeded my expectations.",
  },
  {
    id: 4,
    name: "Emma L.",
    avatar: "/placeholder.svg?height=100&width=100&text=EL",
    rating: 5,
    text: "The automation features have saved me hours of work each week. Highly recommended!",
  },
  {
    id: 5,
    name: "David P.",
    avatar: "/placeholder.svg?height=100&width=100&text=DP",
    rating: 4,
    text: "Very intuitive platform with excellent documentation. Made implementation a breeze.",
  },
]

export function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleReviews, setVisibleReviews] = useState<Review[]>([])

  useEffect(() => {
    // Determine how many reviews to show based on screen size
    const handleResize = () => {
      const width = window.innerWidth
      let visibleCount = 1

      if (width >= 1280) {
        visibleCount = 3
      } else if (width >= 768) {
        visibleCount = 2
      }

      const endIndex = Math.min(currentIndex + visibleCount, reviews.length)
      setVisibleReviews(reviews.slice(currentIndex, endIndex))
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [currentIndex])

  const nextReview = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1
      return nextIndex >= reviews.length ? 0 : nextIndex
    })
  }

  const prevReview = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1
      return nextIndex < 0 ? reviews.length - 1 : nextIndex
    })
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
      ))
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#EEEEEE] mb-4">Customer Reviews</h2>
          <p className="text-xl text-[#EEEEEE]/70 max-w-2xl mx-auto">
            See what our customers have to say about their experience with our products and services
          </p>
        </div>

        <div className="relative">
          <div className="flex overflow-hidden">
            <div className="flex transition-transform duration-300 ease-in-out">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {visibleReviews.map((review) => (
                  <Card key={review.id} className="glass border-[#00ADB5]/20 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                          <Image
                            src={review.avatar || "/placeholder.svg"}
                            alt={review.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-[#EEEEEE]">{review.name}</h4>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                      <p className="text-[#EEEEEE]/70">{review.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-4">
            <Button
              onClick={prevReview}
              variant="outline"
              className="border-[#00ADB5]/30 text-[#00ADB5] hover:bg-[#00ADB5]/10"
            >
              Previous
            </Button>
            <Button
              onClick={nextReview}
              variant="outline"
              className="border-[#00ADB5]/30 text-[#00ADB5] hover:bg-[#00ADB5]/10"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
