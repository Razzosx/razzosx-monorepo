"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, CheckCircle, AlertCircle, Loader2, Mail, Phone, User } from "lucide-react"
import { validateAddress, countries, type AddressValidationResult } from "@/lib/address-validation"
import { useToast } from "@/hooks/use-toast"

interface AddressFormProps {
  onAddressValidated: (address: any, isValid: boolean) => void
  initialData?: {
    full_name?: string
    country?: string
    street?: string
    city?: string
    state?: string
    postal_code?: string
    email?: string
    mobile?: string
    is_default?: boolean
  }
  showDefaultOption?: boolean
}

export function AddressForm({ onAddressValidated, initialData, showDefaultOption = true }: AddressFormProps) {
  const { toast } = useToast()
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null)

  const [addressForm, setAddressForm] = useState({
    full_name: initialData?.full_name || "",
    country: initialData?.country || "",
    street: initialData?.street || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postal_code: initialData?.postal_code || "",
    email: initialData?.email || "",
    mobile: initialData?.mobile || "",
    is_default: initialData?.is_default || false,
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setAddressForm({
        full_name: initialData.full_name || "",
        country: initialData.country || "",
        street: initialData.street || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postal_code: initialData.postal_code || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        is_default: initialData.is_default || false,
      })
      setValidationResult({ valid: true }) // Assume existing addresses are valid
    }
  }, [initialData])

  const handleValidateAddress = async () => {
    if (!addressForm.postal_code || !addressForm.city || !addressForm.country) {
      toast({
        title: "Required Fields",
        description: "Please fill in country, city and postal code to validate",
        variant: "destructive",
      })
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      const result = await validateAddress({
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        postal_code: addressForm.postal_code,
        country: addressForm.country,
      })

      setValidationResult(result)

      if (result.valid && result.formatted) {
        setAddressForm((prev) => ({
          ...prev,
          street: result.formatted?.street || prev.street,
          city: result.formatted?.city || prev.city,
          state: result.formatted?.state || prev.state,
          postal_code: result.formatted?.postal_code || prev.postal_code,
        }))

        toast({
          title: "Address Validated",
          description: "Address found and validated successfully!",
        })
      } else {
        toast({
          title: "Invalid Address",
          description: result.error || "Address not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating address:", error)
      toast({
        title: "Validation Error",
        description: "Could not validate address. Please try again.",
        variant: "destructive",
      })
      setValidationResult({ valid: false, error: "Connection error" })
    } finally {
      setValidating(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    const newForm = { ...addressForm, [field]: value }
    setAddressForm(newForm)
    if (field !== "is_default" && field !== "email" && field !== "mobile" && field !== "full_name") {
      setValidationResult(null)
    }
  }

  const handleSave = () => {
    if (
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.country ||
      !addressForm.postal_code ||
      !addressForm.full_name
    ) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const isValid = validationResult?.valid || initialData !== undefined
    onAddressValidated(addressForm, isValid)
  }

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-[#EEEEEE] flex items-center">
          <User className="h-4 w-4 mr-2" />
          Full Name *
        </Label>
        <Input
          id="full_name"
          value={addressForm.full_name}
          onChange={(e) => handleInputChange("full_name", e.target.value)}
          className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Country Selection */}
      <div className="space-y-2">
        <Label htmlFor="country" className="text-[#EEEEEE] flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Country *
        </Label>
        <Select value={addressForm.country} onValueChange={(value) => handleInputChange("country", value)}>
          <SelectTrigger className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent className="glass border-[#00ADB5]/20">
            {Object.entries(countries).map(([code, info]) => (
              <SelectItem key={code} value={code} className="text-[#EEEEEE] hover:bg-[#00ADB5]/10">
                {info.name}
                {info.hasRealValidation && (
                  <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">Real Validation</Badge>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {addressForm.country && (
        <>
          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="street" className="text-[#EEEEEE]">
                Address *
              </Label>
              <Input
                id="street"
                value={addressForm.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                placeholder="Enter street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-[#EEEEEE]">
                Province / City *
              </Label>
              <Input
                id="city"
                value={addressForm.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                placeholder="Enter city name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-[#EEEEEE] flex items-center">
                ZIP Code *
                {addressForm.country && (
                  <span className="ml-2 text-xs text-[#00ADB5]">
                    (Ex: {countries[addressForm.country as keyof typeof countries]?.example})
                  </span>
                )}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="postal_code"
                  value={addressForm.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                  placeholder={countries[addressForm.country as keyof typeof countries]?.example || "Enter postal code"}
                />
                <Button
                  type="button"
                  onClick={handleValidateAddress}
                  disabled={validating || !addressForm.postal_code || !addressForm.city}
                  className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831] px-3"
                >
                  {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {validationResult && (
                <div
                  className={`flex items-center space-x-2 text-sm ${
                    validationResult.valid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {validationResult.valid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{validationResult.valid ? "Address validated!" : validationResult.error}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-[#EEEEEE]">
                State
              </Label>
              <Input
                id="state"
                value={addressForm.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                placeholder="Enter state/province"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#EEEEEE] flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={addressForm.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-[#EEEEEE] flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Mobile *
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={addressForm.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            {showDefaultOption && (
              <div className="flex items-center space-x-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={addressForm.is_default}
                  onChange={(e) => handleInputChange("is_default", e.target.checked)}
                  className="rounded bg-[#222831] border-[#00ADB5]/30 text-[#00ADB5]"
                />
                <Label htmlFor="is_default" className="text-[#EEEEEE]">
                  Set as default address
                </Label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button onClick={handleSave} className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
              {initialData ? "Update Address" : "Add Address"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
