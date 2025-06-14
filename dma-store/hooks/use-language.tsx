"use client"

import type React from "react"

import { createContext, useContext } from "react"

// Simple English-only translations
const translations = {
  // Common
  loading: "Loading...",
  error: "An error occurred",
  success: "Success!",

  // Account
  account: {
    title: "My Account",
    profile: "Profile",
    orders: "Orders",
    addresses: "Addresses",
    security: "Security",
    country: "Country",
    selectCountry: "Select a country",
    postalCode: "Postal Code",
    postalCodePlaceholder: "Enter postal code",
    city: "City",
    cityPlaceholder: "Enter city name",
    street: "Street",
    streetPlaceholder: "Enter street address",
    state: "State",
    statePlaceholder: "Enter state/province",
    setAsDefault: "Set as default address",
    updateAddress: "Update Address",
    addAddress: "Add Address",
  },

  // Auth
  auth: {
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    confirmPassword: "Confirm Password",
  },

  // Products
  products: {
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    limitedEdition: "Limited Edition",
    bestSeller: "Best Seller",
  },

  // Cart
  cart: {
    title: "Your Cart",
    empty: "Your cart is empty",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    clear: "Clear Cart",
  },
}

type TranslationKey = string | string[]

interface LanguageContextType {
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  t: () => "",
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Function to get translation by key path
  const t = (key: TranslationKey): string => {
    if (Array.isArray(key)) {
      key = key.join(".")
    }

    const keys = typeof key === "string" ? key.split(".") : [key]
    let result: any = translations

    for (const k of keys) {
      if (result[k] === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key.toString()
      }
      result = result[k]
    }

    return result
  }

  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
