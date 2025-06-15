"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export const currencies = {
  // Moedas Tradicionais
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧" },
  BRL: { symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  CNY: { symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  INR: { symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  MXN: { symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },

  // Criptomoedas
  BTC: { symbol: "₿", name: "Bitcoin", flag: "₿" },
  ETH: { symbol: "Ξ", name: "Ethereum", flag: "Ξ" },
  LTC: { symbol: "Ł", name: "Litecoin", flag: "Ł" },
  USDT: { symbol: "₮", name: "Tether", flag: "₮" },
  USDC: { symbol: "USDC", name: "USD Coin", flag: "💰" },
  BNB: { symbol: "BNB", name: "Binance Coin", flag: "🟡" },
  ADA: { symbol: "₳", name: "Cardano", flag: "₳" },
  DOT: { symbol: "●", name: "Polkadot", flag: "●" },
  MATIC: { symbol: "◆", name: "Polygon", flag: "◆" },
  SOL: { symbol: "◎", name: "Solana", flag: "◎" },
} as const

export type Currency = keyof typeof currencies

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (price: number) => string
  convertPrice: (price: number, fromCurrency?: Currency) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Taxas de conversão simuladas (em produção, usar API real)
const exchangeRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  BRL: 5.2,
  CAD: 1.35,
  AUD: 1.45,
  JPY: 110,
  CNY: 6.45,
  INR: 74.5,
  MXN: 20.1,
  BTC: 0.000023,
  ETH: 0.00035,
  LTC: 0.0085,
  USDT: 1.001,
  USDC: 1.0,
  BNB: 0.0025,
  ADA: 2.1,
  DOT: 0.095,
  MATIC: 0.92,
  SOL: 0.0085,
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD")

  useEffect(() => {
    const savedCurrency = localStorage.getItem("razzosx-currency") as Currency
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(savedCurrency)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem("razzosx-currency", newCurrency)
  }

  const convertPrice = (price: number, fromCurrency: Currency = "USD"): number => {
    if (fromCurrency === currency) return price

    // Converter para USD primeiro, depois para moeda desejada
    const usdPrice = price / exchangeRates[fromCurrency]
    return usdPrice * exchangeRates[currency]
  }

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price)
    const currencyInfo = currencies[currency]

    // Formatação especial para criptomoedas
    if (["BTC", "ETH", "LTC"].includes(currency)) {
      return `${currencyInfo.symbol}${convertedPrice.toFixed(8)}`
    }

    if (["USDT", "USDC"].includes(currency)) {
      return `${convertedPrice.toFixed(2)} ${currency}`
    }

    // Formatação para moedas tradicionais
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "BRL" ? "BRL" : "USD",
      minimumFractionDigits: 2,
    })
      .format(convertedPrice)
      .replace(/[A-Z$]/g, currencyInfo.symbol)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    // Fallback seguro em vez de erro
    console.warn("useCurrency must be used within a CurrencyProvider")
    return {
      currency: "USD" as Currency,
      setCurrency: () => {},
      formatPrice: (price: number) => `$${price.toFixed(2)}`,
      convertPrice: (price: number) => price,
    }
  }
  return context
}
