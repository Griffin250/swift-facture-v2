# SwiftFacture

**Professional Invoice Management with Premium Subscriptions**

SwiftFacture is a modern, production-ready invoice and receipt generator with complete Stripe subscription integration, multi-language support, and comprehensive admin dashboard. Built with React and Supabase for scalability and performance.

![SwiftFacture](public/assets/logo/SwiftFactureLogo.png)

## 🚀 **Quick Start**

```bash
# Clone and install
git clone https://github.com/Griffin250/swift-facture-v2.git
cd swift-facture-v2
npm install

# Setup environment
cp .env.example .env
# Configure your Supabase and Stripe keys in .env

# Run development server
npm run dev
```

## ✨ **Key Features**

### 💳 **Premium Subscriptions**
- **Stripe Integration** - Complete payment processing with test and live modes
- **Subscription Plans** - Starter (€19.99), Professional (€39.99), Enterprise (€79.99)
- **Customer Portal** - Self-service subscription management
- **Free Trial System** - 30-day trial with automatic plan management

### 🧾 **Document Management**
- **Professional Invoices** - Multiple templates with live preview
- **Receipt Generation** - Comprehensive receipt system with PDF/PNG export
- **Estimate Creation** - Quote system with conversion to invoices
- **Multi-language Support** - French and English with i18n framework

### 👥 **User Management**
- **Role-based Access** - Admin, user, and trial user roles
- **Avatar System** - User profile management with image uploads
- **Admin Dashboard** - Complete user and subscription management
- **Real-time Chat** - User support with file uploads

### 📊 **Business Intelligence**
- **Analytics Dashboard** - Revenue tracking and user analytics
- **Export Capabilities** - PDF, PNG, and email delivery
- **Status Tracking** - Document workflow management
- **Performance Metrics** - Subscription and usage analytics

## 🏗️ **Architecture**

### **Frontend**
- **React 18** with Vite for optimal performance
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **React Query** for data management

### **Backend**
- **Supabase** - Database, authentication, and edge functions
- **PostgreSQL** - 21-table architecture with RLS security
- **Edge Functions** - Serverless Stripe integration
- **Real-time** - Live chat and notifications

### **Integrations**
- **Stripe** - Payment processing and subscription management
- **Email** - Automated notifications and document delivery
- **PDF Generation** - Server-side document creation
- **File Storage** - Supabase storage for avatars and attachments

## 📁 **Project Structure**

```
swift-facture-v2/
├── src/                    # React application source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── services/          # API and business logic
│   └── contexts/          # React contexts
├── supabase/              # Database and edge functions
│   ├── migrations/        # Database schema
│   └── functions/         # Stripe integration
├── docs/                  # Complete documentation
│   ├── setup/            # Configuration guides
│   ├── development/      # Feature documentation
│   └── deployment/       # Production guides
└── public/               # Static assets
```

## 🌐 **Production Deployment**

### **Prerequisites**
- Node.js 18+
- Supabase project
- Stripe account (test and live keys)

### **Environment Variables**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=<YOUR_SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>

# Stripe Configuration  
STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=<YOUR_WEBHOOK_SECRET>
```

### **Build & Deploy**
```bash
# Production build
npm run build

# Deploy to Vercel, Netlify, or your preferred host
# Edge functions deploy to Supabase automatically
npx supabase functions deploy
```

## 📚 **Documentation**

Comprehensive documentation is available in the `/docs` directory:

- **[Setup Guides](docs/setup/)** - Configuration and installation
- **[Development](docs/development/)** - Feature implementation
- **[Deployment](docs/deployment/)** - Production deployment
- **[Database Architecture](docs/DATABASE_ARCHITECTURE.md)** - Complete schema

## 🔧 **Development**

```bash
# Start development server
npm run dev

# Run database migrations
npx supabase db push

# Deploy edge functions
npx supabase functions deploy

# Type checking
npm run type-check
```

## 🎯 **Production Status**

✅ **Ready for Production** - Clean codebase, comprehensive testing  
✅ **Premium Subscriptions** - Full Stripe integration with customer portal  
✅ **Multi-language** - French and English support  
✅ **Security** - Row Level Security (RLS) and authentication  
✅ **Performance** - Optimized builds and edge functions  
✅ **Documentation** - Complete setup and deployment guides

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 **Support**

- **Documentation**: `/docs` directory
- **Issues**: [GitHub Issues](https://github.com/Griffin250/swift-facture-v2/issues)
- **Email**: Contact via the application's admin panel

---

**SwiftFacture** - Professional invoicing made simple. Built for modern businesses with premium features and enterprise scalability.