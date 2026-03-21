# SouthPlace Catering - Premium Cuisine & Services

A modern, full-stack ecommerce and management system built with Next.js, featuring online ordering, specialized catering services, automated VAT calculations, and a comprehensive admin panel.

## 🚀 Features

### Customer Features
- **Online Menu**: Browse and order authentic cuisine and gourmet dishes.
- **Specialized Services**: Access specialized services like Facilities Management, House Keeping, Industrial Catering, Laundry Services, and Office Catering.
- **User Authentication**: Secure sign-up/login with email verification.
- **Shopping Cart**: Add items, manage quantities, and checkout with automated VAT calculation.
- **Order Tracking**: Real-time order status updates.
- **Order History**: View past orders and receipts.
- **Responsive Design**: Mobile-first design for all devices.

### Admin Features
- **Dashboard**: Real-time analytics, order management, and customer insights.
- **Menu Management**: Add, edit, and organize menu items and categories.
- **Extras Management**: Manage customizable order extras and groups (e.g., side dishes, add-ons).
- **Order Management**: Process orders, update status, and manage deliveries.
- **Customer Management**: View customer data and order history.
- **System Settings**: Configure VAT rates, email notifications, and business information.
- **Analytics**: Sales reports and business performance insights.

### Technical Features
- **Stripe Integration**: Secure payment processing.
- **Email System**: Automated notifications using Resend.
- **JWT Authentication**: Secure admin and customer authentication.
- **Database**: PostgreSQL with Prisma ORM.
- **Responsive UI**: Tailwind CSS with shadcn/ui components.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Resend account with a verified sending domain

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Noladmin/SouthPlace-Ecommerce.git
   cd southplace-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/southplace"

   # JWT Secret (generate a strong random string)
   JWT_SECRET="your-super-secret-jwt-key-here"

   # Email Configuration
   RESEND_API_KEY="re_your_resend_api_key"
   RESEND_FROM_EMAIL="notifications@yourdomain.com"
   RESEND_REPLY_TO_EMAIL="support@yourdomain.com"
   EMAIL_FROM="notifications@yourdomain.com"
   BUSINESS_EMAIL="info@southplace-catering.com"

   # Stripe Configuration
   STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

   # Admin Configuration
   ADMIN_EMAIL="admin@southplace-catering.com"
   ADMIN_PASSWORD="your-admin-password"
   ORDERS_NOTIFY_EMAIL="admin@southplace-catering.com"

   # Twilio SMS Configuration (optional)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="+234..."
   ADMIN_PHONE="+234..."
   # Alternative: ORDERS_NOTIFY_PHONE="+234..."

   # WhatsApp Configuration (optional)
   WHATSAPP_NUMBER="+234..."
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create admin user**
   ```bash
   node scripts/create-admin-simple.js
   ```

6. **Seed menu data (optional)**
   ```bash
   node scripts/seed-menu-data.js
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔐 Security Considerations

### Environment Variables
- **Never commit `.env.local`** - It's already in `.gitignore`
- Use strong, unique passwords for all services
- Rotate secrets regularly
- Use environment-specific configurations

### Database Security
- Use strong database passwords
- Enable SSL connections
- Restrict database access to application servers only
- Regular backups

### API Security
- JWT tokens are stored in HTTP-only cookies
- Admin routes are protected with role-based authentication
- Input validation on all API endpoints
- Rate limiting recommended for production

### Payment Security
- Stripe handles all payment data securely
- No payment information is stored in our database
- Webhook verification for payment confirmations

## 📁 Project Structure

```
southplace-ecommerce/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── account/           # Customer account pages
│   └── ...                # Public pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility libraries
│   ├── services/         # Business logic services
│   └── ...               # Utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Database scripts
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure all environment variables are set
- Build command: `npm run build`
- Start command: `npm start`

## 📧 Email Configuration

The system uses Resend for email notifications:

- **Welcome emails** for new customer registrations
- **Order confirmations** for customers
- **Order notifications** for admin
- **OTP verification** for admin login

Configure your Resend settings in `.env.local` for email functionality.

## 📱 SMS Configuration

The system uses Twilio for SMS notifications:

- **Order notifications** for admin when new orders are placed

To enable SMS notifications:

1. Create a Twilio account and get your credentials
2. Set the following environment variables in `.env.local`:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number (sender)
   - `ADMIN_PHONE` or `ORDERS_NOTIFY_PHONE`: Admin phone number (recipient)

SMS notifications are sent asynchronously alongside email notifications and will gracefully fail if credentials are not configured.

## 🔄 Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email info@southplace-catering.com or create an issue in the repository.

## 🔒 Security Reporting

If you discover a security vulnerability, please email security@southplace-catering.com instead of creating a public issue.

---

**Note**: This is a production-ready application. Ensure all security measures are properly configured before deployment.
