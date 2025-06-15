// Configurações seguras dos provedores de pagamento
export const PAYMENT_PROVIDERS = {
  MONEY_MOTION: {
    apiKey: process.env.MONEY_MOTION_API_KEY,
    baseUrl: "https://api.moneymotion.com/v1",
    webhookSecret: process.env.MONEY_MOTION_WEBHOOK_SECRET,
  },
  PAYPAL: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    baseUrl: process.env.NODE_ENV === "production" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com",
  },
  NOWPAYMENTS: {
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    baseUrl: "https://api.nowpayments.io/v1",
    webhookSecret: process.env.NOWPAYMENTS_WEBHOOK_SECRET,
  },
} as const

// Validação de configuração
export function validatePaymentConfig() {
  const errors: string[] = []

  if (!PAYMENT_PROVIDERS.MONEY_MOTION.apiKey) {
    errors.push("MONEY_MOTION_API_KEY is required")
  }

  if (!PAYMENT_PROVIDERS.PAYPAL.clientId || !PAYMENT_PROVIDERS.PAYPAL.clientSecret) {
    errors.push("PayPal credentials are required")
  }

  if (!PAYMENT_PROVIDERS.NOWPAYMENTS.apiKey) {
    errors.push("NOWPAYMENTS_API_KEY is required")
  }

  if (errors.length > 0) {
    console.warn("Payment configuration warnings:", errors)
  }

  return errors.length === 0
}

// Utilitários de segurança
export function sanitizePaymentData(data: any) {
  // Remove campos sensíveis dos logs
  const sanitized = { ...data }
  delete sanitized.apiKey
  delete sanitized.clientSecret
  delete sanitized.webhookSecret
  delete sanitized.cardNumber
  delete sanitized.cvv
  delete sanitized.password
  return sanitized
}

export function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
