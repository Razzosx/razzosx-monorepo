"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Bell, CheckCircle, AlertCircle, ShoppingBag, User, Package } from "lucide-react"

interface AdminNotificationsProps {
  onNotificationsRead?: () => void
}

export function AdminNotifications({ onNotificationsRead }: AdminNotificationsProps) {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])

      // Mark notifications as read
      const unreadIds = data?.filter((n) => !n.read).map((n) => n.id) || []
      if (unreadIds.length > 0) {
        await markNotificationsAsRead(unreadIds)
        if (onNotificationsRead) {
          onNotificationsRead()
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markNotificationsAsRead = async (ids: string[]) => {
    try {
      const { error } = await supabase.from("admin_notifications").update({ read: true }).in("id", ids)

      if (error) throw error
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return <ShoppingBag className="h-5 w-5 text-[#00ADB5]" />
      case "new_user":
        return <User className="h-5 w-5 text-[#00ADB5]" />
      case "low_stock":
        return <Package className="h-5 w-5 text-yellow-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      default:
        return <Bell className="h-5 w-5 text-[#00ADB5]" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="h-12 w-12 text-[#00ADB5]/50 mb-4" />
        <p className="text-[#EEEEEE]/70 text-center">No notifications to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border ${notification.read ? "border-[#EEEEEE]/10 bg-[#222831]/50" : "border-[#00ADB5]/20 bg-[#00ADB5]/5"}`}
        >
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <h4 className="text-[#EEEEEE] font-medium">{notification.title}</h4>
              <p className="text-[#EEEEEE]/70 text-sm mt-1">{notification.message}</p>
              <p className="text-[#EEEEEE]/50 text-xs mt-2">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNotifications}
          className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
        >
          Refresh
        </Button>
      </div>
    </div>
  )
}
