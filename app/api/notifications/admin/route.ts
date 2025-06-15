import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, orderId, message, metadata } = body

    // Buscar todos os admins
    const { data: admins, error: adminError } = await supabase.from("users").select("id, email").eq("is_admin", true)

    if (adminError) {
      console.error("Error fetching admins:", adminError)
      return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 })
    }

    // Criar notificações para cada admin
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: type,
      title: getNotificationTitle(type),
      message: message,
      order_id: orderId,
      metadata: metadata,
      read: false,
      created_at: new Date().toISOString(),
    }))

    const { error: notificationError } = await supabase.from("admin_notifications").insert(notifications)

    if (notificationError) {
      console.error("Error creating notifications:", notificationError)
      return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 })
    }

    // Log da notificação
    console.log("Admin notifications created:", {
      type,
      orderId,
      adminCount: admins.length,
    })

    return NextResponse.json({
      success: true,
      notificationsSent: admins.length,
    })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case "payment_confirmed":
      return "Pagamento Confirmado"
    case "new_order":
      return "Novo Pedido"
    case "payment_failed":
      return "Falha no Pagamento"
    case "refund_requested":
      return "Reembolso Solicitado"
    default:
      return "Notificação"
  }
}
