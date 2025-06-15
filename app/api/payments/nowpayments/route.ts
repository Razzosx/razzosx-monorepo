import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { PAYMENT_PROVIDERS, sanitizePaymentData } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, currency = "USD", cryptoCurrency = "btc" } = body

    // Validar dados de entrada
    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Buscar pedido
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Preparar dados para NOWPayments
    const paymentData = {
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      pay_currency: cryptoCurrency.toLowerCase(),
      order_id: orderId,
      order_description: `Order #${orderId}`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?order=${orderId}`,
    }

    // Chamar API do NOWPayments
    const response = await fetch(`${PAYMENT_PROVIDERS.NOWPAYMENTS.baseUrl}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": PAYMENT_PROVIDERS.NOWPAYMENTS.apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("NOWPayments error:", sanitizePaymentData(result))
      return NextResponse.json({ error: "Payment processing failed" }, { status: 400 })
    }

    // Atualizar pedido com informações de pagamento
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_id: result.payment_id,
        payment_status: result.payment_status,
        payment_method: "nowpayments",
        payment_details: {
          cryptoCurrency: cryptoCurrency,
          payAddress: result.pay_address,
          payAmount: result.pay_amount,
          actuallyPaid: result.actually_paid || 0,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
    }

    // Log da transação
    console.log(
      "Crypto payment created:",
      sanitizePaymentData({
        orderId,
        paymentId: result.payment_id,
        status: result.payment_status,
        amount,
        currency,
        cryptoCurrency,
      }),
    )

    return NextResponse.json({
      success: true,
      paymentId: result.payment_id,
      status: result.payment_status,
      payAddress: result.pay_address,
      payAmount: result.pay_amount,
      cryptoCurrency: cryptoCurrency,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${result.pay_address}`,
    })
  } catch (error) {
    console.error("NOWPayments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
