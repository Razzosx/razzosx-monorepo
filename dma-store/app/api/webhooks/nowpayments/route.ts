import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { PAYMENT_PROVIDERS } from "@/lib/payment-providers"
import * as crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    // Verify the webhook signature
    const signature = request.headers.get("x-nowpayments-sig")
    if (!signature) {
      console.error("Missing NOWPayments signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Verify the signature using the webhook secret
    const hmac = crypto.createHmac("sha512", PAYMENT_PROVIDERS.NOWPAYMENTS.webhookSecret!)
    hmac.update(rawBody)
    const calculatedSignature = hmac.digest("hex")

    if (calculatedSignature !== signature) {
      console.error("Invalid NOWPayments signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Process the webhook payload
    const {
      order_id,
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
    } = body

    if (!order_id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 })
    }

    console.log("NOWPayments webhook received:", {
      order_id,
      payment_id,
      payment_status,
      price_amount,
      price_currency,
    })

    // Update the order status based on the payment status
    let orderStatus = "pending"
    if (payment_status === "finished" || payment_status === "confirmed") {
      orderStatus = "paid"
    } else if (payment_status === "failed" || payment_status === "expired") {
      orderStatus = "cancelled"
    }

    // Update the order in the database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: payment_status,
        status: orderStatus,
        payment_details: {
          paymentId: payment_id,
          payAddress: pay_address,
          priceAmount: price_amount,
          priceCurrency: price_currency,
          payAmount: pay_amount,
          payCurrency: pay_currency,
          updatedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // If payment is confirmed, create admin notification
    if (payment_status === "finished" || payment_status === "confirmed") {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/admin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "payment_confirmed",
            orderId: order_id,
            message: `Crypto payment confirmed for order #${order_id}`,
            metadata: {
              paymentId: payment_id,
              amount: price_amount,
              currency: price_currency,
            },
          }),
        })
      } catch (notifyError) {
        console.error("Error creating admin notification:", notifyError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("NOWPayments webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
