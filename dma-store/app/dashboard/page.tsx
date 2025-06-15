"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { AdminNotifications } from "@/components/admin-notifications"
import { supabase } from "@/lib/supabase"
import { ImageUpload } from "@/components/image-upload"
import { useCurrency } from "@/hooks/use-currency"
import { useToast } from "@/hooks/use-toast"
import { Package, Users, ShoppingBag, Settings, Plus, Pencil, Trash2, X, Bell } from "lucide-react"

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCloseOrderDialogOpen, setIsCloseOrderDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [closeOrderReason, setCloseOrderReason] = useState("")
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category: "",
    featured: false,
    redirect_url: "",
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/dashboard")
      return
    }

    if (!isAdmin) {
      router.push("/")
      return
    }

    fetchData()
  }, [user, isAdmin, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard stats
      // Fetch orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })

      if (ordersError) throw ordersError

      // Fetch pending orders count
      const { count: pendingCount, error: pendingError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      if (pendingError) throw pendingError

      // Fetch products count
      const { count: productsCount, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

      if (productsError) throw productsError

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })

      if (usersError) throw usersError

      setStats({
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        pendingOrders: pendingCount || 0,
      })

      // Fetch products
      const { data: productsData, error: productsDataError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsDataError) throw productsDataError
      setProducts(productsData || [])

      // Fetch orders with user details
      const { data: ordersData, error: ordersDataError } = await supabase
        .from("orders")
        .select(`
          *,
          users (id, email),
          shipping_address_id
        `)
        .order("created_at", { ascending: false })

      if (ordersDataError) throw ordersDataError

      // For each order, fetch the shipping address details separately
      const ordersWithAddresses = await Promise.all(
        (ordersData || []).map(async (order) => {
          if (order.shipping_address_id) {
            const { data: addressData, error: addressError } = await supabase
              .from("user_addresses")
              .select("*")
              .eq("id", order.shipping_address_id)
              .single()

            if (!addressError && addressData) {
              return { ...order, shipping_address: addressData }
            }
          }
          return order
        }),
      )

      setOrders(ordersWithAddresses || [])

      // Fetch users - without trying to join with user_profiles
      const { data: usersData, error: usersError2 } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError2) throw usersError2

      // Fetch user profiles separately for each user
      const usersWithProfiles = await Promise.all(
        (usersData || []).map(async (user) => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle()

            if (!profileError && profileData) {
              return { ...user, profile: profileData }
            }
            return user
          } catch (error) {
            console.error("Error fetching user profile:", error)
            return user
          }
        }),
      )

      setUsers(usersWithProfiles || [])

      // Fetch notifications
      try {
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("admin_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (!notificationsError) {
          setNotifications(notificationsData || [])
          // Check for unread notifications
          const unreadCount = notificationsData?.filter((n) => !n.read).length || 0
          setHasUnreadNotifications(unreadCount > 0)
        }
      } catch (notificationError) {
        console.error("Error fetching notifications:", notificationError)
        // Don't throw here, just log the error and continue
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProductFormChange = (field: string, value: any) => {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (url: string) => {
    setProductForm((prev) => ({ ...prev, image_url: url }))
  }

  const handleAddProduct = async () => {
    try {
      // Cria um objeto com os dados do produto
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number.parseFloat(productForm.price),
        image_url: productForm.image_url,
        category: productForm.category,
        featured: productForm.featured,
        redirect_url: productForm.redirect_url || null,
      }

      // Adiciona o stock apenas se o valor for fornecido
      if (productForm.stock) {
        productData.stock = Number.parseInt(productForm.stock)
      }

      const { data, error } = await supabase.from("products").insert(productData).select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // Reset form and refresh products
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        image_url: "",
        category: "",
        featured: false,
        redirect_url: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    try {
      // Cria um objeto com os dados do produto
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number.parseFloat(productForm.price),
        image_url: productForm.image_url,
        category: productForm.category,
        featured: productForm.featured,
        redirect_url: productForm.redirect_url || null,
      }

      // Adiciona o stock apenas se o valor for fornecido
      if (productForm.stock) {
        productData.stock = Number.parseInt(productForm.stock)
      }

      const { error } = await supabase.from("products").update(productData).eq("id", selectedProduct.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product updated successfully",
      })

      // Reset form and refresh products
      setSelectedProduct(null)
      setIsEditDialogOpen(false)
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        image_url: "",
        category: "",
        featured: false,
        redirect_url: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", selectedProduct.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      // Reset and refresh
      setSelectedProduct(null)
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleCloseOrder = async () => {
    if (!selectedOrder || !closeOrderReason) return

    try {
      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", selectedOrder.id)

      if (updateError) throw updateError

      // Create notification for the user
      try {
        await supabase.from("user_notifications").insert({
          user_id: selectedOrder.user_id,
          title: "Order Cancelled",
          message: `Your order #${selectedOrder.id} has been cancelled. Reason: ${closeOrderReason}`,
          type: "order_cancelled",
          read: false,
        })
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError)
        // Continue even if notification creation fails
      }

      toast({
        title: "Success",
        description: "Order closed successfully",
      })

      // Reset and refresh
      setSelectedOrder(null)
      setCloseOrderReason("")
      setIsCloseOrderDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error closing order:", error)
      toast({
        title: "Error",
        description: "Failed to close order",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (product: any) => {
    setSelectedProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      featured: product.featured || false,
      redirect_url: product.redirect_url || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseOrderClick = (order: any) => {
    setSelectedOrder(order)
    setIsCloseOrderDialogOpen(true)
  }

  const handleNotificationRead = () => {
    // This will be called when notifications are marked as read
    setHasUnreadNotifications(false)
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#EEEEEE]">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-[#00ADB5]/20 max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#EEEEEE]">Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#EEEEEE]">
                      Product Name
                    </Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => handleProductFormChange("name", e.target.value)}
                      className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#EEEEEE]">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => handleProductFormChange("description", e.target.value)}
                      className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE] min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-[#EEEEEE]">
                        Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => handleProductFormChange("price", e.target.value)}
                        className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-[#EEEEEE]">
                        Stock
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => handleProductFormChange("stock", e.target.value)}
                        className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#EEEEEE]">
                      Category
                    </Label>
                    <Input
                      id="category"
                      value={productForm.category}
                      onChange={(e) => handleProductFormChange("category", e.target.value)}
                      className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redirect_url" className="text-[#EEEEEE]">
                      Redirect URL (Optional)
                    </Label>
                    <Input
                      id="redirect_url"
                      value={productForm.redirect_url}
                      onChange={(e) => handleProductFormChange("redirect_url", e.target.value)}
                      placeholder="https://example.com"
                      className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                    />
                    <p className="text-xs text-[#EEEEEE]/70">
                      If provided, customers will be redirected to this URL after checkout instead of the payment page
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={productForm.featured}
                      onChange={(e) => handleProductFormChange("featured", e.target.checked)}
                      className="rounded bg-[#222831] border-[#00ADB5]/30 text-[#00ADB5]"
                    />
                    <Label htmlFor="featured" className="text-[#EEEEEE]">
                      Featured Product
                    </Label>
                  </div>
                  <div className="space-y-2">
                      <ImageUpload 
                        onChange={handleImageUpload}
                        onRemove={() => setProductForm((prev) => ({ ...prev, image_url: "" }))}
                        value={productForm.image_url}
                     />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct} className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
                    Add Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-[#00ADB5]/30 text-[#EEEEEE] hover:bg-[#00ADB5]/10 relative">
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ADB5] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ADB5]"></span>
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-[#00ADB5]/20 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#EEEEEE]">Notifications</DialogTitle>
                </DialogHeader>
                <AdminNotifications onNotificationsRead={handleNotificationRead} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-[#00ADB5]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#EEEEEE]/70 text-sm">Total Orders</p>
                  <h3 className="text-3xl font-bold text-[#EEEEEE]">{stats.totalOrders}</h3>
                </div>
                <div className="bg-[#00ADB5]/20 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-[#00ADB5]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-[#00ADB5]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#EEEEEE]/70 text-sm">Total Products</p>
                  <h3 className="text-3xl font-bold text-[#EEEEEE]">{stats.totalProducts}</h3>
                </div>
                <div className="bg-[#00ADB5]/20 p-3 rounded-full">
                  <Package className="h-6 w-6 text-[#00ADB5]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-[#00ADB5]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#EEEEEE]/70 text-sm">Total Users</p>
                  <h3 className="text-3xl font-bold text-[#EEEEEE]">{stats.totalUsers}</h3>
                </div>
                <div className="bg-[#00ADB5]/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-[#00ADB5]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-[#00ADB5]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#EEEEEE]/70 text-sm">Pending Orders</p>
                  <h3 className="text-3xl font-bold text-[#EEEEEE]">{stats.pendingOrders}</h3>
                </div>
                <div className="bg-[#00ADB5]/20 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-[#00ADB5]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#222831]">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEEEEE]/10">
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Image</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Name</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Price</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Stock</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Category</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Featured</th>
                        <th className="text-right py-3 px-4 text-[#EEEEEE]/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-[#EEEEEE]/10">
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 bg-[#393E46] rounded-md flex items-center justify-center">
                              {product.image_url ? (
                                <img
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-[#EEEEEE]/50" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#EEEEEE]">{product.name}</td>
                          <td className="py-3 px-4 text-[#EEEEEE]">{formatPrice(product.price)}</td>
                          <td className="py-3 px-4 text-[#EEEEEE]">
                            {product.stock !== undefined ? product.stock : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-[#EEEEEE]">{product.category || "-"}</td>
                          <td className="py-3 px-4">
                            {product.featured ? (
                              <Badge className="bg-[#00ADB5]/20 text-[#00ADB5] hover:bg-[#00ADB5]/30">Featured</Badge>
                            ) : (
                              <Badge variant="outline" className="border-[#EEEEEE]/20 text-[#EEEEEE]/50">
                                No
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(product)}
                                className="h-8 w-8 p-0 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteClick(product)}
                                className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEEEEE]/10">
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Order ID</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Customer</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Amount</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Status</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Date</th>
                        <th className="text-right py-3 px-4 text-[#EEEEEE]/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#EEEEEE]/10">
                          <td className="py-3 px-4 text-[#EEEEEE] font-mono">{order.id.substring(0, 8)}</td>
                          <td className="py-3 px-4">
                            <div className="text-[#EEEEEE]">
                              {order.shipping_address?.full_name ||
                                order.shipping_address?.name ||
                                (order.users?.email || "").split("@")[0] ||
                                "Unknown"}
                            </div>
                            <div className="text-[#EEEEEE]/70 text-xs">{order.users?.email || "No email"}</div>
                          </td>
                          <td className="py-3 px-4 text-[#EEEEEE]">{formatPrice(order.total_amount || 0)}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`
                                ${order.status === "completed" ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}
                                ${order.status === "pending" ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" : ""}
                                ${order.status === "cancelled" ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : ""}
                                ${order.status === "processing" ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : ""}
                              `}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-[#EEEEEE]/70">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-[#EEEEEE] hover:bg-[#00ADB5]/10"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="glass border-[#00ADB5]/20">
                                  <DialogHeader>
                                    <DialogTitle className="text-[#EEEEEE]">Order Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Order ID</h3>
                                        <p className="text-[#EEEEEE] font-mono">{order.id}</p>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Date</h3>
                                        <p className="text-[#EEEEEE]">{new Date(order.created_at).toLocaleString()}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Customer</h3>
                                      <p className="text-[#EEEEEE]">
                                        {order.shipping_address?.full_name ||
                                          order.shipping_address?.name ||
                                          "Not provided"}
                                      </p>
                                      <p className="text-[#EEEEEE]/70">{order.users?.email}</p>
                                      <p className="text-[#EEEEEE]/70">
                                        {order.shipping_address?.mobile || order.shipping_address?.phone || "No phone"}
                                      </p>
                                    </div>

                                    {order.shipping_address && (
                                      <div>
                                        <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Shipping Address</h3>
                                        <p className="text-[#EEEEEE]/70">
                                          {order.shipping_address.street || order.shipping_address.address}
                                        </p>
                                        <p className="text-[#EEEEEE]/70">
                                          {order.shipping_address.city || ""}
                                          {order.shipping_address.city && order.shipping_address.state ? ", " : ""}
                                          {order.shipping_address.state || ""}{" "}
                                          {order.shipping_address.postal_code || order.shipping_address.zip_code || ""}
                                        </p>
                                        <p className="text-[#EEEEEE]/70">{order.shipping_address.country}</p>
                                      </div>
                                    )}

                                    <div>
                                      <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Order Total</h3>
                                      <p className="text-[#00ADB5] text-xl font-bold">
                                        {formatPrice(order.total_amount || 0)}
                                      </p>
                                    </div>

                                    <div>
                                      <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Payment Method</h3>
                                      <p className="text-[#EEEEEE]">
                                        {order.payment_method === "credit_card"
                                          ? "Credit Card"
                                          : order.payment_method === "paypal"
                                            ? "PayPal"
                                            : order.payment_method || "Not specified"}
                                      </p>
                                    </div>

                                    <div>
                                      <h3 className="text-sm font-medium text-[#EEEEEE]/70 mb-1">Status</h3>
                                      <Badge
                                        className={`
                                          ${order.status === "completed" ? "bg-green-500/20 text-green-400" : ""}
                                          ${order.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : ""}
                                          ${order.status === "cancelled" ? "bg-red-500/20 text-red-400" : ""}
                                          ${order.status === "processing" ? "bg-blue-500/20 text-blue-400" : ""}
                                        `}
                                      >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCloseOrderClick(order)}
                                className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                                disabled={order.status === "cancelled"}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEEEEE]/10">
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">User ID</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Name</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Email</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Phone</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Status</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Role</th>
                        <th className="text-left py-3 px-4 text-[#EEEEEE]/70">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-[#EEEEEE]/10">
                          <td className="py-3 px-4 text-[#EEEEEE] font-mono">{user.id.substring(0, 8)}</td>
                          <td className="py-3 px-4 text-[#EEEEEE]">
                            {user.profile?.first_name && user.profile?.last_name
                              ? `${user.profile.first_name} ${user.profile.last_name}`
                              : "Not provided"}
                          </td>
                          <td className="py-3 px-4 text-[#EEEEEE]">{user.email}</td>
                          <td className="py-3 px-4 text-[#EEEEEE]">{user.profile?.phone || "Not provided"}</td>
                          <td className="py-3 px-4">
                            {user.email_confirmed_at ? (
                              <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500/20 text-yellow-400">
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {user.is_admin ? (
                              <Badge className="bg-[#00ADB5]/20 text-[#00ADB5] hover:bg-[#00ADB5]/30">Admin</Badge>
                            ) : (
                              <Badge variant="outline" className="border-[#EEEEEE]/20 text-[#EEEEEE]">
                                User
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#EEEEEE]/70">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass border-[#00ADB5]/20">
              <CardHeader>
                <CardTitle className="text-[#EEEEEE]">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-[#EEEEEE] mb-4">Store Settings</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="store-name" className="text-[#EEEEEE]">
                          Store Name
                        </Label>
                        <Input
                          id="store-name"
                          defaultValue="Razzosx DMA Store"
                          className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-description" className="text-[#EEEEEE]">
                          Store Description
                        </Label>
                        <Textarea
                          id="store-description"
                          defaultValue="Digital marketplace for all your needs"
                          className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-[#EEEEEE]">
                          Currency
                        </Label>
                        <Input
                          id="currency"
                          defaultValue="USD"
                          className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#EEEEEE] mb-4">Payment Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enable-paypal"
                          defaultChecked
                          className="rounded bg-[#222831] border-[#00ADB5]/30 text-[#00ADB5]"
                        />
                        <Label htmlFor="enable-paypal" className="text-[#EEEEEE]">
                          Enable PayPal
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enable-credit-card"
                          defaultChecked
                          className="rounded bg-[#222831] border-[#00ADB5]/30 text-[#00ADB5]"
                        />
                        <Label htmlFor="enable-credit-card" className="text-[#EEEEEE]">
                          Enable Credit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enable-crypto"
                          className="rounded bg-[#222831] border-[#00ADB5]/30 text-[#00ADB5]"
                        />
                        <Label htmlFor="enable-crypto" className="text-[#EEEEEE]">
                          Enable Cryptocurrency
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass border-[#00ADB5]/20 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#EEEEEE]">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[#EEEEEE]">
                Product Name
              </Label>
              <Input
                id="edit-name"
                value={productForm.name}
                onChange={(e) => handleProductFormChange("name", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-[#EEEEEE]">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => handleProductFormChange("description", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE] min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-[#EEEEEE]">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => handleProductFormChange("price", e.target.value)}
                  className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock" className="text-[#EEEEEE]">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => handleProductFormChange("stock", e.target.value)}
                  className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-[#EEEEEE]">
                Category
              </Label>
              <Input
                id="edit-category"
                value={productForm.category}
                onChange={(e) => handleProductFormChange("category", e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-redirect-url" className="text-[#EEEEEE]">
                Redirect URL (Optional)
              </Label>
              <Input
                id="edit-redirect-url"
                value={productForm.redirect_url}
                onChange={(e) => handleProductFormChange("redirect_url", e.target.value)}
                placeholder="https://example.com"
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE]"
              />
              <p className="text-xs text-[#EEEEEE]/70">
                If provided, customers will be redirected to this URL after checkout instead of the payment page
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                checked={productForm.featured}
                onChange={(e) => handleProductFormChange("featured", e.target.checked)}
                className="rounded bg-[#222831] border-[#00ADB5]/30 text-[#00ADB5]"
              />
              <Label htmlFor="edit-featured" className="text-[#EEEEEE]">
                Featured Product
              </Label>
            </div>
            <div className="space-y-2">
                      <ImageUpload 
                        onChange={handleImageUpload}
                        onRemove={() => setProductForm((prev) => ({ ...prev, image_url: "" }))}
                        value={productForm.image_url}
                     />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditProduct} className="bg-[#00ADB5] hover:bg-[#008B94] text-[#222831]">
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass border-[#00ADB5]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#EEEEEE]">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#EEEEEE]/70">
              This will permanently delete the product "{selectedProduct?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#EEEEEE]/20 text-[#EEEEEE] hover:bg-[#EEEEEE]/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Order Dialog */}
      <Dialog open={isCloseOrderDialogOpen} onOpenChange={setIsCloseOrderDialogOpen}>
        <DialogContent className="glass border-[#00ADB5]/20">
          <DialogHeader>
            <DialogTitle className="text-[#EEEEEE]">Close Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-[#EEEEEE]/70">
              Please provide a reason for closing this order. This will be sent as a notification to the customer.
            </p>
            <div className="space-y-2">
              <Label htmlFor="close-reason" className="text-[#EEEEEE]">
                Reason
              </Label>
              <Textarea
                id="close-reason"
                value={closeOrderReason}
                onChange={(e) => setCloseOrderReason(e.target.value)}
                className="bg-[#222831] border-[#00ADB5]/30 text-[#EEEEEE] min-h-[100px]"
                placeholder="Enter the reason for closing this order..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCloseOrderDialogOpen(false)}
              className="border-[#EEEEEE]/20 text-[#EEEEEE] hover:bg-[#EEEEEE]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseOrder}
              disabled={!closeOrderReason}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Close Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
