"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Bell, CheckCircle, AlertCircle, ShoppingBag, Package, Info } from "lucide-react"

interface UserNotificationsProps {
  onNotificationsRead?: () => void
}

export function UserNotifications({ onNotificationsRead }: UserNotificationsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Verificar se a tabela existe antes de consultar
      const { error: tableCheckError } = await supabase.from("user_notifications").select("id").limit(1).single()

      // Se houver erro relacionado à tabela não existente, definimos um array vazio e retornamos
      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        console.log("Notifications table does not exist yet. This is normal if you haven't run the migration.")
        setNotifications([])
        setLoading(false)
        return
      }

      // Se a tabela existir, buscamos as notificações
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])

      // Marcar notificações como lidas
      const unreadIds = data?.filter((n) => !n.read).map((n) => n.id) || []
      if (unreadIds.length > 0) {
        await markNotificationsAsRead(unreadIds)
        if (onNotificationsRead) {
          onNotificationsRead()
        }
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const markNotificationsAsRead = async (ids: string[]) => {
    try {
      const { error } = await supabase.from("user_notifications").update({ read: true }).in("id", ids)

      if (error) throw error
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_status":
        return <ShoppingBag className="h-5 w-5 text-[#00ADB5]" />
      case "order_cancelled":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case "order_shipped":
        return <Package className="h-5 w-5 text-green-400" />
      case "system":
        return <Info className="h-5 w-5 text-blue-400" />
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-[#EEEEEE]/70 text-center">Unable to load notifications</p>
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
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex items-center space-x-4">
          {getNotificationIcon(notification.type)}
          <div>
            <p className="font-medium">{notification.title}</p>
            <p className="text-sm text-[#EEEEEE]/70">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
