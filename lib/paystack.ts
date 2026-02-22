type PaystackInitInput = {
  amount: number
  email: string
  currency?: string
  reference?: string
  metadata?: Record<string, any>
  callbackUrl?: string
}

const looksLikePaystackSecret = (key: string) =>
  key.toUpperCase().includes("PAYSTACK") &&
  (key.toUpperCase().includes("SECRET") || key.toUpperCase().endsWith("_SK"))

const looksLikePaystackPublic = (key: string) =>
  key.toUpperCase().includes("PAYSTACK") &&
  (key.toUpperCase().includes("PUBLIC") || key.toUpperCase().includes("PUBLISHABLE"))

function findEnvValue(predicate: (key: string) => boolean): string | null {
  for (const [key, value] of Object.entries(process.env)) {
    if (predicate(key) && value && value.trim().length > 0) {
      return value.trim()
    }
  }
  return null
}

export function getPaystackSecretKey(): string | null {
  return (
    process.env.PAYSTACK_SECRET_KEY?.trim() ||
    process.env.PAYSTACK_SECRET?.trim() ||
    process.env.PAYSTACK_SK?.trim() ||
    process.env.PAYSTACK_SECRETE_KEY?.trim() ||
    findEnvValue(looksLikePaystackSecret)
  ) || null
}

export function getPaystackPublicKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() ||
    process.env.PAYSTACK_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_PAYSTACK_KEY?.trim() ||
    process.env.PAYSTACK_PUBLISHABLE_KEY?.trim() ||
    findEnvValue(looksLikePaystackPublic)
  ) || null
}

async function paystackRequest(path: string, init?: RequestInit) {
  const secret = getPaystackSecretKey()
  if (!secret) {
    throw new Error("Paystack secret key is not configured")
  }

  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.status) {
    throw new Error(data?.message || "Paystack request failed")
  }

  return data
}

export async function initializePaystackTransaction(input: PaystackInitInput) {
  const payload = {
    amount: Math.round(input.amount * 100),
    email: input.email,
    currency: (input.currency || "NGN").toUpperCase(),
    reference: input.reference,
    metadata: input.metadata || {},
    callback_url: input.callbackUrl,
  }

  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function verifyPaystackTransaction(reference: string) {
  const safeRef = encodeURIComponent(reference)
  return paystackRequest(`/transaction/verify/${safeRef}`, {
    method: "GET",
  })
}
