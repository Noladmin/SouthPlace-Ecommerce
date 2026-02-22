// Centralized error handling service
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = {
  // Database errors
  handleDatabaseError: (error: any) => {
    console.error('Database Error:', error)
    
    if (error.code === 'P2002') {
      return {
        message: 'A record with this information already exists',
        statusCode: 409
      }
    }
    
    if (error.code === 'P2025') {
      return {
        message: 'Record not found',
        statusCode: 404
      }
    }
    
    if (error.code === 'P2003') {
      return {
        message: 'Invalid reference to related record',
        statusCode: 400
      }
    }
    
    return {
      message: 'Database operation failed',
      statusCode: 500
    }
  },

  // Authentication errors
  handleAuthError: (error: any) => {
    console.error('Authentication Error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return {
        message: 'Invalid authentication token',
        statusCode: 401
      }
    }
    
    if (error.name === 'TokenExpiredError') {
      return {
        message: 'Authentication token has expired',
        statusCode: 401
      }
    }
    
    return {
      message: 'Authentication failed',
      statusCode: 401
    }
  },

  // Validation errors
  handleValidationError: (error: any) => {
    console.error('Validation Error:', error)
    
    if (error.name === 'ZodError') {
      const messages = error.issues.map((err: any) => err.message).join(', ')
      return {
        message: `Validation failed: ${messages}`,
        statusCode: 400
      }
    }
    
    return {
      message: 'Invalid input data',
      statusCode: 400
    }
  },

  // Email errors
  handleEmailError: (error: any) => {
    console.error('Email Error:', error)
    
    if (error.code === 'EAUTH') {
      return {
        message: 'Email authentication failed. Please check your email settings.',
        statusCode: 500
      }
    }
    
    if (error.code === 'ECONNECTION') {
      return {
        message: 'Unable to connect to email server',
        statusCode: 500
      }
    }
    
    return {
      message: 'Failed to send email',
      statusCode: 500
    }
  },

  // Payment errors
  handlePaymentError: (error: any) => {
    console.error('Payment Error:', error)
    
    if (error.type === 'card_error') {
      return {
        message: error.message || 'Payment card error',
        statusCode: 400
      }
    }
    
    if (error.type === 'validation_error') {
      return {
        message: 'Payment validation failed',
        statusCode: 400
      }
    }
    
    return {
      message: 'Payment processing failed',
      statusCode: 500
    }
  },

  // Generic error handler
  handleError: (error: any) => {
    console.error('Application Error:', error)
    
    // Handle known error types
    if (error instanceof AppError) {
      return {
        message: error.message,
        statusCode: error.statusCode
      }
    }
    
    // Handle Prisma errors
    if (error?.code && typeof error.code === 'string' && error.code.startsWith('P')) {
      return errorHandler.handleDatabaseError(error)
    }
    
    // Handle JWT errors
    if (error?.name && String(error.name).includes('JsonWebToken')) {
      return errorHandler.handleAuthError(error)
    }
    
    // Handle Zod validation errors
    if (error?.name === 'ZodError') {
      return errorHandler.handleValidationError(error)
    }
    
    // Handle Stripe errors
    if (error?.type && String(error.type).includes('card_error')) {
      return errorHandler.handlePaymentError(error)
    }
    
    // Default error
    return {
      message: 'An unexpected error occurred',
      statusCode: 500
    }
  },

  // Create user-friendly error messages
  getUserFriendlyMessage: (error: any) => {
    const handled = errorHandler.handleError(error)
    
    // Map technical messages to user-friendly ones
    const messageMap: { [key: string]: string } = {
      'Database operation failed': 'We\'re experiencing technical difficulties. Please try again.',
      'Record not found': 'The requested information could not be found.',
      'A record with this information already exists': 'This information is already registered in our system.',
      'Invalid authentication token': 'Your session has expired. Please sign in again.',
      'Authentication token has expired': 'Your session has expired. Please sign in again.',
      'Authentication failed': 'Invalid email or password. Please try again.',
      'Validation failed': 'Please check your input and try again.',
      'Invalid input data': 'Please check your input and try again.',
      'Email authentication failed': 'We\'re having trouble sending emails. Please contact support.',
      'Unable to connect to email server': 'We\'re having trouble sending emails. Please contact support.',
      'Failed to send email': 'We\'re having trouble sending emails. Please contact support.',
      'Payment card error': 'There was an issue with your payment method. Please try again.',
      'Payment validation failed': 'Please check your payment information and try again.',
      'Payment processing failed': 'We\'re having trouble processing your payment. Please try again.',
      'An unexpected error occurred': 'Something went wrong. Please try again or contact support.'
    }
    
    return messageMap[handled.message] || handled.message
  }
}

// Error response helper
export const createErrorResponse = (error: any) => {
  const handled = errorHandler.handleError(error)
  const userMessage = errorHandler.getUserFriendlyMessage(error)
  
  return {
    success: false,
    error: userMessage,
    details: process.env.NODE_ENV === 'development' ? handled.message : undefined,
    statusCode: handled.statusCode
  }
}

export default errorHandler 