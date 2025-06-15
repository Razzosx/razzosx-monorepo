import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { PAYMENT_PROVIDERS, sanitizePaymentData, generatePaymentId } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, currency = "USD", cardData } = body

    // Validar dados de entrada
    if (!orderId || !amount || !cardData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Buscar pedido
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Preparar dados para Money Motion
    const paymentData = {
      amount: amount,
      currency: currency,
      orderId: orderId,
      paymentId: generatePaymentId(),
      card: {
        number: cardData.number,
        expiry: cardData.expiry,
        cvv: cardData.cvv,
        name: cardData.name,
      },
      metadata: {
        orderId: orderId,
        userId: order.user_id,
      },
    }

    // Chamar API do Money Motion
    const response = await fetch(`${PAYMENT_PROVIDERS.MONEY_MOTION.baseUrl}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYMENT_PROVIDERS.MONEY_MOTION.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Money Motion error:", sanitizePaymentData(result))
      return NextResponse.json({ error: "Payment processing failed" }, { status: 400 })
    }

    // Atualizar pedido com informações de pagamento
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_id: result.paymentId,
        payment_status: result.status,
        payment_method: "money_motion",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
    }

    // Log da transação (sem dados sensíveis)
    console.log(
      "Payment processed:",
      sanitizePaymentData({
        orderId,
        paymentId: result.paymentId,
        status: result.status,
        amount,
        currency,
      }),
    )

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      status: result.status,
      redirectUrl: result.redirectUrl,
    })
  } catch (error) {
    console.error("Money Motion payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
