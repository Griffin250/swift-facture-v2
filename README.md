# SwiftFacture

**Fast. Professional. Effortless.**

SwiftFacture is a modern invoice and receipt generator built with React. Create professional invoices, estimates, and receipts in seconds with beautiful templates, multi-language support, and client-side PDF generation.

![SwiftFacture](public/assets/logo/SwiftFactureLogo.png)

## ✨ Features

### 🧾 **Invoice & Document Generation**
- Professional invoice templates with live preview
- Receipt generation with customizable layouts
- **Estimate creation system** with professional templates and PDF generation
- PDF export with print-optimized output
- Auto-calculation of taxes, totals, and currency
- **Document status tracking** (draft, sent, paid, etc.)
- Multiple template system for all document types

### 🔐 **Advanced Authentication & User Management**
- **Role-based Access Control (RBAC)** with 3 levels: User, Admin, Super Admin
- **User profile management** with avatar upload and personal information editing
- **Advanced user authentication** with Supabase integration
- **Password reset and account management** features
- **User activity logging** and session management

### 🛡️ **Comprehensive Admin Dashboard**
- **Full admin panel** with multiple management sections
- **User management interface** - view, edit, delete users, change roles, reset passwords
- **Database management tools** - direct database operations and role assignments
- **System settings panel** - SMTP configuration, security settings, notification preferences
- **Admin analytics dashboard** with business metrics and insights

### 📊 **Business Intelligence & Analytics**
- **Dashboard metrics** - users, customers, invoices, estimates, receipts, revenue tracking
- **Revenue monitoring** with payment status analysis
- **User activity feeds** and recent business activity
- **Trial user tracking** for business growth insights
- **Document analytics** and performance metrics

### 🌍 **Multi-Language Support**
- **French (Default)** and **English** interfaces
- Real-time language switching
- Persistent language preferences
- Complete UI translation including:
  - Navigation and buttons
  - Form labels and placeholders
  - Premium plans and features
  - Authentication pages
  - Admin panel and settings

### 🎨 **Enhanced UI/UX & Customization**
- 10+ professional invoice templates
- **Advanced settings system** with notifications, preferences, privacy controls
- **Profile avatar system** with image upload, preview, and management
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- Loading states and error handling

### 💼 **Advanced Business Features**
- **Customer management system** with detailed customer profiles
- **Estimate-to-invoice conversion** workflow
- Multiple template options (Template1-Template10)
- Premium service tiers with feature gating
- **Business settings configuration** (currency, tax rates, prefixes)
- **Document numbering system** with customizable prefixes

### 💾 **Supabase Database Integration**
- **Complete database schema** with all business entities
- **Row Level Security (RLS)** policies for data protection
- **Database migration system** with proper versioning
- **Storage integration** for file uploads (avatars, documents)
- **Real-time data synchronization** across all features

### 🔒 **Security & Privacy**
- **Advanced security settings** (password policies, session management, 2FA options)
- **Data encryption** and secure storage
- **Audit logs** and user activity tracking
- **Role-based data access** with fine-grained permissions
- **Secure file storage** with size limits and type validation

## 🚀 Quick Start

### Prerequisites
- Node.js (16+ recommended)
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Griffin250/PayFlow2.git
cd SwiftFacture

# Install dependencies
npm install

# Install additional dependencies (if not already installed)
npm install react-i18next i18next i18next-browser-languagedetector
npm install @supabase/supabase-js

# Set up environment variables
# Copy .env.example to .env and configure:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing

### **Backend & Database**
- **Supabase** - Complete backend-as-a-service platform
- **PostgreSQL** - Robust relational database with advanced features
- **Row Level Security (RLS)** - Database-level security policies
- **Supabase Auth** - Complete authentication system
- **Supabase Storage** - File storage for avatars and documents

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

### **Internationalization**
- **react-i18next** - React integration for i18next
- **i18next** - Internationalization framework
- **i18next-browser-languagedetector** - Language detection

### **PDF Generation & File Handling**
- **jsPDF** - Client-side PDF generation
- **html2canvas** - HTML to canvas rendering
- **File Upload System** - Avatar and document upload capabilities

### **State Management & Hooks**
- **React Context API** - Global state management for auth and theme
- **Custom Hooks** - Role management, language switching, and business logic
- **Local Storage** - Client-side data persistence

## 📁 Project Structure

```
SwiftFacture/
├── public/
│   ├── assets/
│   │   ├── icons/          # Flag icons for language switching
│   │   ├── logo/           # SwiftFacture branding assets
│   │   └── template*.png   # Template preview images
├── src/
│   ├── components/
│   │   ├── templates/      # Invoice/Receipt/Estimate templates
│   │   ├── admin/          # Admin dashboard components
│   │   │   └── panels/     # Admin panel sections
│   │   ├── ui/            # Reusable UI components (shadcn/ui)
│   │   ├── Header.jsx     # Main navigation with i18n
│   │   ├── UserProfile.jsx # User profile dropdown
│   │   └── ...
│   ├── pages/
│   │   ├── About.jsx      # About page (translated)
│   │   ├── Premium.jsx    # Premium plans (translated)
│   │   ├── Login.jsx      # Authentication (translated)
│   │   ├── AdminPage.jsx  # Admin dashboard
│   │   ├── Profile.jsx    # User profile page
│   │   ├── EditProfile.jsx # Profile editing
│   │   ├── Settings.jsx   # User settings
│   │   ├── Estimate.jsx   # Estimate creation
│   │   ├── ReceiptPage.jsx # Receipt generation
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.jsx # Authentication state management
│   │   └── ThemeContext.jsx # Theme management
│   ├── hooks/
│   │   ├── useLanguage.js # Custom language management hook
│   │   └── useRole.js     # Role-based access control hook
│   ├── services/
│   │   ├── adminService.js # Admin operations
│   │   └── roleService.js  # Role management
│   ├── integrations/
│   │   └── supabase/      # Supabase client and types
│   ├── i18n/
│   │   ├── index.js       # i18n configuration
│   │   └── resources/     # Translation files
│   │       ├── fr/        # French translations
│   │       └── en/        # English translations
│   ├── utils/
│   │   ├── pdfGenerator.js
│   │   ├── avatarStorage.js # Avatar upload utilities
│   │   └── templateRegistry.js
│   └── ...
├── supabase/
│   ├── config.toml        # Supabase configuration
│   └── migrations/        # Database migration files
├── components.json        # shadcn/ui configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite configuration
```

## 🌐 Multi-Language Implementation

SwiftFacture supports French (default) and English with a robust i18n setup:

### **Language Features:**
- 🇫🇷 **French**: Complete native translation
- 🇺🇸 **English**: Professional English translation
- 🔄 **Real-time switching**: Via header dropdown
- 💾 **Persistent preferences**: Saved in localStorage
- 🛡️ **Fallback system**: Graceful handling of missing translations

### **Translated Pages:**
- ✅ Navigation and Header
- ✅ Premium Plans & Pricing
- ✅ About Page & FAQ
- ✅ Authentication (Login/Register)
- ✅ All UI Components

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Development variations
npm run build:dev    # Development build
```

## 🎯 Usage Guide

### **Creating Documents:**
1. **Invoices**: Navigate to Invoice page, select template, fill details, add items, export as PDF
2. **Estimates**: Create professional estimates with conversion to invoices
3. **Receipts**: Generate instant payment receipts with detailed calculations
4. **Templates**: Choose from 10+ professional templates for all document types

### **User Management:**
1. **Registration**: Create account with email verification
2. **Profile Management**: Upload avatar, edit personal information
3. **Role System**: User, Admin, Super Admin with different permissions
4. **Settings**: Customize notifications, preferences, and business settings

### **Admin Features:**
1. **User Management**: View, edit, delete users, manage roles
2. **Analytics Dashboard**: Monitor business metrics, revenue, user activity
3. **System Settings**: Configure SMTP, security policies, notifications
4. **Database Management**: Direct database operations and maintenance

### **Language Switching:**
1. Click the language dropdown in header
2. Select French (🇫🇷) or English (🇺🇸)
3. Interface updates immediately
4. Preference saved automatically

### **Premium Features:**
- Multiple subscription tiers (Free, Starter, Pro, Growth)
- Advanced template options
- Priority support
- Enhanced business analytics
- Advanced user management tools

## 🔧 Configuration

### **Adding New Languages:**
1. Create new translation file: `src/i18n/resources/[lang]/common.json`
2. Add language to i18n config: `src/i18n/index.js`
3. Add flag icon: `public/assets/icons/[lang]Flag.png`
4. Update language dropdown in Header component

### **Customizing Templates:**
Templates are located in `src/components/templates/`. Each template is a React component with:
- Professional styling for invoices, estimates, and receipts
- Print optimization
- Dynamic data binding
- Currency formatting
- Watermark support
- Multiple layout options

### **Database Configuration:**
The app uses Supabase with comprehensive database schema:
- **Tables**: profiles, customers, invoices, estimates, receipts, user_roles, activity_logs
- **Security**: Row Level Security (RLS) policies for data protection
- **Storage**: Avatar and document storage with file size limits
- **Migrations**: Version-controlled database schema changes

### **Role-Based Access Control:**
1. **User Role**: Access to own documents and basic features
2. **Admin Role**: View all users and documents, basic management
3. **Super Admin Role**: Full system access, user management, system settings

## 🚀 Deployment

### **Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Netlify:**
```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### **Other Platforms:**
The project generates static files that can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆕 Recent Features Added

### **Authentication & User Management System** ✨
- Complete role-based access control (User, Admin, Super Admin)
- User profile management with avatar uploads
- Advanced admin dashboard with user management capabilities
- Password reset and account management features

### **Supabase Integration** 🗄️
- Full database integration with PostgreSQL
- Row Level Security (RLS) for data protection
- Real-time data synchronization
- Secure file storage for avatars and documents

### **Business Intelligence** 📊
- Advanced analytics dashboard
- Revenue tracking and business metrics
- User activity monitoring and logs
- Document status tracking and reporting

### **Document Management Enhancements** 📄
- Professional estimate creation system
- Enhanced receipt generation
- Multiple template options for all document types
- Document-to-document conversion workflows

### **System Administration** ⚙️
- Comprehensive admin panel with multiple sections
- System settings configuration (SMTP, security, notifications)
- Database management tools
- Advanced user role management

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first styling approach
- **shadcn/ui** - For beautiful, accessible components
- **Supabase** - For the complete backend-as-a-service platform
- **Vercel** - For excellent deployment platform

---

**Made with ❤️ by Griffin250**

*SwiftFacture - Fast. Professional. Effortless.* 