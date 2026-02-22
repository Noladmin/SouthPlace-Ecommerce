import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, service, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log the contact form submission (in production, you would send an email or save to database)
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      company,
      service,
      message,
      timestamp: new Date().toISOString(),
    });

    // In a real application, you would:
    // 1. Send an email notification to the business
    // 2. Save the submission to a database
    // 3. Send an auto-reply to the customer
    // 4. Integrate with CRM systems

    // For now, we'll just return a success response
    return NextResponse.json(
      { 
        message: 'Thank you for your message. We will get back to you soon!',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
