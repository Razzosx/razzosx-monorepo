"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressForm } from "@/components/address-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, MapPin, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false)
  const [isDeleteAddressDialogOpen, setIsDeleteAddressDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/account")
      return
    }

    fetchUserData()
  }, [user, router])

  const fetchUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Fetch user addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (addressesError) throw addressesError

      setProfile(profileData || { user_id: user.id })
      setAddresses(addressesData || [])

      // Set profile form data
      setProfileForm({
        firstName: profileData?.first_name || "",
        lastName: profileData?.last_name || "",
        email: user.email || "",
        phone: profileData?.phone || "",
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load your account information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      // Update user profile
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your profile has been updated",
      })

      fetchUserData()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your password has been updated",
      })

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangePasswordDialogOpen(false)
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change your password",
        variant: "destructive",
      })
    }
  }

  const handleAddressValidated = async (address: any, isValid: boolean) => {
    if (!isValid || !user) return

    try {
      // Verificar se as colunas necessárias existem na tabela
      const { error: schemaError } = await supabase.from("user_addresses").select("id").limit(1).single()

      if (schemaError && schemaError.message.includes("does not exist")) {
        toast({
          title: "Error",
          description: "Address table not properly configured. Please contact support.",
          variant: "destructive",
        })
        return
      }

      // If this is the first address, set it as default
      const isDefault = addresses.length === 0 ? true : address.is_default

      // If setting this address as default, unset any existing default
      if (isDefault) {
        await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id)
      }

      // Prepare address data, excluding fields that might not exist in the table
      const addressData = {
        user_id: user.id,
        street: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: isDefault,
      }

      // Add optional fields if they exist in the address object
      if (address.full_name !== undefined) {
        addressData.full_name = address.full_name
      }

      if (address.email !== undefined) {
        addressData.email = address.email
      }

      if (address.mobile !== undefined) {
        addressData.mobile = address.mobile
      }

      if (selectedAddress) {
        // Update existing address
        const { error } = await supabase.from("user_addresses").update(addressData).eq("id", selectedAddress.id)

        if (error) {
          console.error("Error updating address:", error)
          throw error
        }

        toast({
          title: "Success",
          description: "Address updated successfully",
        })
      } else {
        // Add new address
        const { error } = await supabase.from("user_addresses").insert(addressData)

        if (error) {
          console.error("Error adding address:", error)
          throw error
        }

        toast({
          title: "Success",
          description: "Address added successfully",
        })
      }

      // Close dialogs and refresh data
      setIsAddressDialogOpen(false)
      setIsEditAddressDialogOpen(false)
      setSelectedAddress(null)
      fetchUserData()
    } catch (error) {
      console.error("Error saving address:", error)
      toast({
        title: "Error",
        description: `Failed to save address: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address)
    setIsEditAddressDialogOpen(true)
  }

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return

    try {
      const { error } = await supabase.from("user_addresses").delete().eq("id", selectedAddress.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Address deleted successfully",
      })

      setIsDeleteAddressDialogOpen(false)
      setSelectedAddress(null)
      fetchUserData()
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      // Unset all defaults first
      await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user?.id)

      // Set the selected address as default
      const { error } = await supabase.from("user_addresses").update({ is_default: true }).eq("id", addressId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Default address updated",
      })

      fetchUserData()
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADB5]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#EEEEEE] mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#222831]">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[#EEEEEE]">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => handleProfileFormChange("firstName", e.target.value)}
                          className="pl-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                          placeholder="Enter your first name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[#EEEEEE]">
                        Last Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => handleProfileFormChange("lastName", e.target.value)}
                          className="pl-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#EEEEEE]">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                        <Input
                          id="email"
                          value={profileForm.email}
                          disabled
                          className="pl-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE] opacity-70"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#EEEEEE]">
                        Phone
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-[#EEEEEE]/50" />
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => handleProfileFormChange("phone", e.target.value)}
                          className="pl-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsChangePasswordDialogOpen(true)}
                      className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                    >
                      Change Password
                    </Button>
                    <Button onClick={handleUpdateProfile} className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                      Update Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#EEEEEE]">My Addresses</CardTitle>
                <Button
                  onClick={() => setIsAddressDialogOpen(true)}
                  className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-[#EEEEEE]/30 mx-auto mb-4" />
                    <p className="text-[#EEEEEE]/70">You haven't added any addresses yet</p>
                    <Button
                      onClick={() => setIsAddressDialogOpen(true)}
                      variant="outline"
                      className="mt-4 border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                    >
                      Add Your First Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-lg border ${
                          address.is_default ? "border-[#00ADB5] bg-[#00ADB5]/5" : "border-[#EEEEEE]/10 bg-[#222831]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-[#EEEEEE] font-medium">{address.full_name || "Address"}</h3>
                          {address.is_default && (
                            <span className="text-xs bg-[#00ADB5]/20 text-[#00ADB5] px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-[#EEEEEE]/70">{address.street}</p>
                        <p className="text-[#EEEEEE]/70">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-[#EEEEEE]/70">{address.country}</p>
                        {address.email && <p className="text-[#EEEEEE]/70 mt-2">{address.email}</p>}
                        {address.mobile && <p className="text-[#EEEEEE]/70">{address.mobile}</p>}

                        <div className="flex justify-end space-x-2 mt-4">
                          {!address.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="text-xs border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAddress(address)}
                            className="h-8 w-8 p-0 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAddress(address)
                              setIsDeleteAddressDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                            disabled={addresses.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="glass border-[#00ADB5]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#EEEEEE]">Add New Address</DialogTitle>
          </DialogHeader>
          <AddressForm onAddressValidated={handleAddressValidated} />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditAddressDialogOpen} onOpenChange={setIsEditAddressDialogOpen}>
        <DialogContent className="glass border-[#00ADB5]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#EEEEEE]">Edit Address</DialogTitle>
          </DialogHeader>
          <AddressForm onAddressValidated={handleAddressValidated} initialData={selectedAddress} />
        </DialogContent>
      </Dialog>

      {/* Delete Address Dialog */}
      <AlertDialog open={isDeleteAddressDialogOpen} onOpenChange={setIsDeleteAddressDialogOpen}>
        <AlertDialogContent className="glass border-[#00ADB5]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#EEEEEE]">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#EEEEEE]/70">
              This will permanently delete this address. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#EEEEEE]/20 text-[#EEEEEE] hover:bg-[#EEEEEE]/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="glass border-[#00ADB5]/20">
          <DialogHeader>
            <DialogTitle className="text-[#EEEEEE]">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-[#EEEEEE]">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange("currentPassword", e.target.value)}
                  className="pr-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 text-[#EEEEEE]/50 hover:text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[#EEEEEE]">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFormChange("newPassword", e.target.value)}
                  className="pr-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[#EEEEEE]">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFormChange("confirmPassword", e.target.value)}
                  className="pr-10 bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordDialogOpen(false)}
              className="border-[#EEEEEE]/20 text-[#EEEEEE] hover:bg-[#EEEEEE]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!passwordForm.newPassword || !passwordForm.confirmPassword}
              className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]"
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
