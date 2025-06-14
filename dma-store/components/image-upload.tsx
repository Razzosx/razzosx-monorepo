"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Criar FormData para upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload para Vercel Blob (simulado)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha no upload")
      }

      const { url } = await response.json()

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        onChange(url)
        setUploadProgress(0)
        toast({
          title: "Sucesso",
          description: "Imagem enviada com sucesso!",
        })
      }, 500)
    } catch (error) {
      console.error("Erro no upload:", error)
      toast({
        title: "Erro",
        description: "Falha ao enviar imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-[#EEEEEE]">Imagem do Produto</Label>

      {value ? (
        <Card className="glass border-[#00ADB5]/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative group">
              <div className="relative aspect-video w-full">
                <Image src={value || "/placeholder.svg"} alt="Product image" fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onRemove}
                  disabled={disabled}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`glass border-[#00ADB5]/20 transition-all duration-200 ${
            dragActive ? "border-[#00ADB5] bg-[#00ADB5]/10" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[#00ADB5]/40"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              {uploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-[#00ADB5] animate-spin" />
                  <div className="w-full max-w-xs">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-[#EEEEEE]/70 mt-2">Enviando... {uploadProgress}%</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#00ADB5]/20 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-[#00ADB5]" />
                  </div>
                  <div>
                    <p className="text-[#EEEEEE] font-medium mb-2">Clique para enviar ou arraste uma imagem</p>
                    <p className="text-[#EEEEEE]/70 text-sm">PNG, JPG, WEBP até 5MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="glass border-[#00ADB5]/30 text-[#00ADB5] hover:bg-[#00ADB5]/10"
                    disabled={disabled}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <Alert className="bg-[#00ADB5]/10 border-[#00ADB5]/20">
        <ImageIcon className="h-4 w-4 text-[#00ADB5]" />
        <AlertDescription className="text-[#EEEEEE]/70">
          Recomendamos imagens com proporção 16:9 (1920x1080px) para melhor visualização.
        </AlertDescription>
      </Alert>
    </div>
  )
}
