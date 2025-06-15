import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sanitizePaymentData, generatePaymentId } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, currency = "USD", paypalEmail } = body

    // Validar dados de entrada
    if (!orderId || !amount || !paypalEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Buscar pedido
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Gerar ID de pagamento único
    const paymentId = generatePaymentId()

    // Para PayPal F&F, criamos um registro de pagamento pendente
    // O pagamento será confirmado manualmente pelo admin
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_id: paymentId,
        payment_status: "pending_manual_confirmation",
        payment_method: "paypal_ff",
        payment_details: {
          paypalEmail: paypalEmail,
          instructions: "Send payment as Friends & Family",
          amount: amount,
          currency: currency,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Log da transação
    console.log(
      "PayPal F&F payment initiated:",
      sanitizePaymentData({
        orderId,
        paymentId,
        amount,
        currency,
        paypalEmail,
      }),
    )

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      status: "pending_manual_confirmation",
      instructions: {
        paypalEmail: process.env.PAYPAL_BUSINESS_EMAIL || "payments@razzosx.com",
        amount: amount,
        currency: currency,
        orderId: orderId,
        note: `Order #${orderId} - Send as Friends & Family`,
      },
    })
  } catch (error) {
    console.error("PayPal F&F payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
