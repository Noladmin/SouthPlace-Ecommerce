/**
 * Email service configuration
 * Centralized configuration for SMTP/email settings
 */

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
    type?: string
  }
  requireTLS?: boolean
  tls?: {
    rejectUnauthorized: boolean
  }
  authMethod?: string
}

/**
 * Gets email configuration from environment variables
 * Supports both EMAIL_* and SMTP_* naming conventions for backward compatibility
 */
export function getEmailConfig(): EmailConfig | null {
  // Primary: EMAIL_* prefix
  // Fallback: SMTP_* prefix (for backward compatibility)
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
  const portString = process.env.EMAIL_PORT || process.env.SMTP_PORT
  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS

  // Validate required configuration
  if (!host || !portString || !user || !pass) {
    const missing = {
      host: !host,
      port: !portString,
      user: !user,
      pass: !pass,
    }
    console.warn('[Email Config] Missing required configuration:', missing)
    return null
  }

  // Parse and validate port
  const port = parseInt(portString, 10)
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`[Email Config] Invalid port number: ${portString}`)
    return null
  }

  // Determine security settings based on port
  const secure = port === 465 // Port 465 uses SSL
  
  // Some servers require full email address as username
  // Try to detect if username is already an email, if not, construct it
  let authUser = user
  if (user && !user.includes('@') && host.includes('.')) {
    // If username doesn't contain @, try using it as-is first
    // Many servers require full email, but we'll let the server error guide us
    console.log('[Email Config] Username does not contain @, using as-is. If auth fails, try full email address.')
  }
  
  const config: EmailConfig = {
    host,
    port,
    secure,
    auth: { 
      user: authUser, 
      pass 
    },
  }
  
  // Log configuration (without exposing password)
  console.log('[Email Config] Configuration loaded:', {
    host,
    port,
    secure,
    user: authUser ? (authUser.includes('@') ? `${authUser.split('@')[0]}@***` : `${authUser.substring(0, 3)}***`) : 'missing',
  })

  // Configure TLS settings based on port
  if (port === 587) {
    // Port 587 uses STARTTLS (TLS upgrade)
    config.requireTLS = true
    config.tls = {
      rejectUnauthorized: false, // Allow self-signed certificates
    }
  } else if (port === 465) {
    // Port 465 uses SSL/TLS
    config.tls = {
      rejectUnauthorized: false, // Allow self-signed certificates
    }
  } else {
    // For other ports, add basic TLS config
    config.tls = {
      rejectUnauthorized: false,
    }
  }

  return config
}


/**
 * Gets the FROM email address from environment variables
 */
export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    'noreply@tastybowls.com'
  )
}
