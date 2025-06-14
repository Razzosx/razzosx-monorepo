// Utilitário para lidar com conexões de rede e retentativas
import { toast } from "@/components/ui/use-toast"

// Configurações globais
const MAX_RETRIES = 3
const BASE_TIMEOUT = 5000 // 5 segundos
const CONNECTION_ERROR_SHOWN: Record<string, boolean> = {} // Rastreia erros já mostrados

// Função para retry com timeout e backoff exponencial
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    key?: string // Chave única para evitar múltiplos toasts do mesmo erro
    showError?: boolean
    timeout?: number
  } = {},
): Promise<T> {
  const { retries = MAX_RETRIES, key = "global", showError = true, timeout = BASE_TIMEOUT } = options

  // Função para executar com timeout
  const executeWithTimeout = async (): Promise<T> => {
    return new Promise((resolve, reject) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        reject(new Error("Request timeout"))
      }, timeout)

      fn()
        .then((result) => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  // Tentativas com backoff exponencial
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await executeWithTimeout()
    } catch (error: any) {
      const isLastAttempt = attempt === retries - 1

      // Log mais detalhado apenas na última tentativa
      if (isLastAttempt) {
        console.error(`Falha após ${retries} tentativas:`, error)

        // Mostrar toast apenas uma vez por chave de erro
        if (showError && !CONNECTION_ERROR_SHOWN[key]) {
          CONNECTION_ERROR_SHOWN[key] = true
          toast({
            title: "Problema de conexão",
            description: "Verifique sua conexão e tente novamente.",
            variant: "destructive",
          })

          // Resetar após 30 segundos para permitir nova notificação
          setTimeout(() => {
            CONNECTION_ERROR_SHOWN[key] = false
          }, 30000)
        }

        throw error
      }

      // Backoff exponencial: 1s, 2s, 4s, etc.
      const delay = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Falha após múltiplas tentativas") // Nunca deve chegar aqui
}

// Função para verificar status da conexão
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}

// Limpar cache de erros (útil ao mudar de página)
export function clearErrorCache(): void {
  Object.keys(CONNECTION_ERROR_SHOWN).forEach((key) => {
    CONNECTION_ERROR_SHOWN[key] = false
  })
}
