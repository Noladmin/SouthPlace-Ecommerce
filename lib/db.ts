import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const url = process.env.DATABASE_URL
  console.log(`[DB] Initializing connection pool. URL set: ${!!url}, SSL: ${process.env.NODE_ENV === 'production'}`)

  const pool = new Pool({
    connectionString: url,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  })
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Helper function to retry database operations
export const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Check if it's a connection error
      if (error instanceof Error &&
        (error.message.includes("Can't reach database server") ||
          error.message.includes("Connection") ||
          error.message.includes("timeout"))) {

        console.log(`Database connection attempt ${attempt} failed, retrying...`)

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
          continue
        }
      }

      // If it's not a connection error or we've exhausted retries, throw
      throw error
    }
  }

  throw lastError!
} 
