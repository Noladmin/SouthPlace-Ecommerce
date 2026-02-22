type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function getClientIp(request: Request): string {
  const xf = request.headers.get('x-forwarded-for') || ''
  const ip = xf.split(',')[0].trim()
  return ip || 'local'
}

export function allowRateLimit(request: Request, scope: string, windowMs: number, max: number): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getClientIp(request)
  const key = `${scope}:${ip}`
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }
  if (bucket.count >= max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt }
  }
  bucket.count += 1
  return { allowed: true, remaining: Math.max(0, max - bucket.count), resetAt: bucket.resetAt }
} 