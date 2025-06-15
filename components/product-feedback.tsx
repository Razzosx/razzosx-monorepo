"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ThumbsUp, AlertCircle, ShoppingBag } from "lucide-react"

interface Feedback {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string
  created_at: string
  user_email?: string
}

interface ProductFeedbackProps {
  productId: string
}

export function ProductFeedback({ productId }: ProductFeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userFeedback, setUserFeedback] = useState<Feedback | null>(null)
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState("5")
  const [hasPurchased, setHasPurchased] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchFeedbacks()
    if (user) {
      checkUserPurchase()
    }
  }, [productId, user])

  const checkUserPurchase = async () => {
    if (!user) return

    try {
      // Check if the user has purchased this product
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("status", "paid")
        .limit(1)

      if (error) throw error

      setHasPurchased(data && data.length > 0)
    } catch (error) {
      console.error("Error checking purchase:", error)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)

      // Fetch all feedbacks for this product
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("product_feedbacks")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })

      if (feedbackError) throw feedbackError

      // Get user emails separately
      const userIds = feedbackData?.map((f) => f.user_id) || []
      const { data: userData, error: userError } = await supabase.from("users").select("id, email").in("id", userIds)

      if (userError) {
        console.warn("Could not fetch user data:", userError)
      }

      // Combine feedback with user data
      const feedbacksWithUsers =
        feedbackData?.map((feedback) => ({
          ...feedback,
          user_email: userData?.find((u) => u.id === feedback.user_id)?.email || "Anonymous User",
        })) || []

      setFeedbacks(feedbacksWithUsers)

      // Check if current user has already left feedback
      if (user) {
        const userFeedback = feedbacksWithUsers.find((feedback) => feedback.user_id === user.id) || null
        setUserFeedback(userFeedback)

        if (userFeedback) {
          setComment(userFeedback.comment)
          setRating(userFeedback.rating.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to leave a comment",
        variant: "destructive",
      })
      return
    }

    if (!hasPurchased) {
      toast({
        title: "Purchase Required",
        description: "You need to purchase this product to leave a review",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      if (userFeedback) {
        // Update existing feedback
        const { error } = await supabase
          .from("product_feedbacks")
          .update({
            rating: Number.parseInt(rating),
            comment,
          })
          .eq("id", userFeedback.id)

        if (error) throw error

        toast({
          title: "Feedback Updated",
          description: "Thank you for updating your feedback!",
        })
      } else {
        // Create new feedback
        const { error } = await supabase.from("product_feedbacks").insert({
          user_id: user.id,
          product_id: productId,
          rating: Number.parseInt(rating),
          comment,
        })

        if (error) throw error

        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
        })
      }

      // Refresh feedbacks
      fetchFeedbacks()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0)
    return (sum / feedbacks.length).toFixed(1)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EEEEEE] mb-2 flex items-center">
          <MessageSquare className="h-7 w-7 mr-3 text-[#00ADB5]" />
          Customer Reviews
        </h2>
        <p className="text-[#EEEEEE]/70">
          {feedbacks.length > 0 ? `Based on ${feedbacks.length} reviews` : "No reviews yet"}
        </p>

        {feedbacks.length > 0 && (
          <div className="flex items-center mt-4 space-x-4">
            <div className="bg-[#00ADB5]/20 rounded-xl p-4 flex items-center space-x-3">
              <span className="text-3xl font-bold text-[#00ADB5]">{getAverageRating()}</span>
              <div className="text-[#EEEEEE]/70">
                <div>Average Rating</div>
                <div className="text-sm">out of 5</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leave a review section - only show for users who purchased the product */}
      {user && hasPurchased && (
        <Card className="glass border-[#00ADB5]/20">
          <CardHeader>
            <CardTitle className="text-[#EEEEEE]">{userFeedback ? "Update Your Review" : "Leave a Review"}</CardTitle>
            <CardDescription className="text-[#EEEEEE]/70">Share your experience with this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#EEEEEE]">Rating</label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]">
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]">
                  <SelectItem value="5">★★★★★ (5) - Excellent</SelectItem>
                  <SelectItem value="4">★★★★☆ (4) - Good</SelectItem>
                  <SelectItem value="3">★★★☆☆ (3) - Average</SelectItem>
                  <SelectItem value="2">★★☆☆☆ (2) - Poor</SelectItem>
                  <SelectItem value="1">★☆☆☆☆ (1) - Terrible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#EEEEEE]">Your Review</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback here"
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE] min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleSubmitFeedback}
              disabled={submitting || !comment.trim()}
              className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]"
            >
              {submitting ? "Submitting..." : userFeedback ? "Update" : "Submit"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Message for logged in users who haven't purchased */}
      {user && !hasPurchased && (
        <Card className="glass border-[#00ADB5]/20">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="h-12 w-12 text-[#00ADB5]/70 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-[#EEEEEE] mb-2">Leave a Review</h3>
            <p className="text-[#EEEEEE]/70 mb-4">You need to purchase this product to leave a review</p>
          </CardContent>
        </Card>
      )}

      {/* Message for users who aren't logged in */}
      {!user && (
        <Card className="glass border-[#00ADB5]/20">
          <CardContent className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-[#00ADB5]/70 mx-auto mb-3" />
            <p className="text-[#EEEEEE]/70 mb-4">Please login to leave a review</p>
            <Button asChild className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
              <a href="/login">Login</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[#EEEEEE]">All Reviews</h3>
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} className="glass border-[#00ADB5]/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="bg-[#00ADB5]/20 text-[#00ADB5]">
                        <AvatarFallback>{getInitials(feedback.user_email || "AN")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[#EEEEEE]">{feedback.user_email}</div>
                        <div className="text-sm text-[#EEEEEE]/70">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-[#00ADB5]/20 px-3 py-1 rounded-full">
                      <ThumbsUp className="h-4 w-4 text-[#00ADB5]" />
                      <span className="text-[#00ADB5] font-medium">{feedback.rating}/5</span>
                    </div>
                  </div>
                  <Separator className="my-4 bg-[#00ADB5]/20" />
                  <p className="text-[#EEEEEE]/80">{feedback.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-16 w-16 text-[#EEEEEE]/30 mx-auto mb-4" />
          <p className="text-[#EEEEEE]/70 text-lg">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  )
}
