# SwiftFacture

**Fast & Professional Invoice Management with Premium Subscriptions**

SwiftFacture is a modern invoice and receipt generator with complete Stripe subscription integration, 30-day free trials, and comprehensive admin dashboard. Built with React, featuring real-time analytics and professional payment processing.

![SwiftFacture](public/assets/logo/SwiftFactureLogo.png)

## ✨ Features
### 💬 **Chat System & Live Support**
- **User/Admin Chat Separation**: Users see only their own messages; admins can select users and view their chats
- **File & Image Uploads**: Upload files/images in chat using Supabase Storage (requires 'chat-files' bucket)
- **Real-time Updates**: Chat panel updates instantly for all users
- **Refresh & Clear Controls**: Refresh chat messages or clear your own chat view (does not delete from DB)
- **Modern UI/UX**: Distinct message alignment and colors for own vs. others' messages
- **Admin User Selection**: Admins can select users by email/first_name to view their chat history

### 🚀 **Latest Major Updates (November 2025)**
- **🎨 Revolutionary Template Editor**: Modern 2-column layout with live preview and fullscreen modal system
- **📊 Enhanced Dashboard**: 8-item pagination system with smart navigation and improved analytics
- **🔄 Receipt System Overhaul**: Complete consolidation of receipt functionality into unified `/receipts` route
- **👤 Advanced User Management**: Role-based access control with avatar support and admin dashboard
- **🗄️ Database Enhancement**: Comprehensive migration system with status tracking and performance optimization

### **v2.4.0** - October 2025 - *Production Ready* ⭐` route
- **⚡ Enhanced Action Buttons**: Full suite of receipt actions - Save, Send, Download (PDF/PNG), Email, Print  
- **🎯 Streamlined Navigation**: Improved user flow with home-linked branding and duplicate removal
- **📱 Integrated Dashboard**: Inline receipt creation with real-time preview and comprehensive management
- **🔔 Advanced Notifications**: Toast feedback system for all user actions and error handling
- **🎨 UI/UX Polish**: Loading states, status indicators, and smooth interaction patterns

### 🧾 **Invoice & Document Generation**
- Professional invoice templates with live preview
- **Advanced Receipt System** with unified workflow and inline creation
- **Comprehensive Action Buttons** - Save, send, download (PDF/PNG), email, print
- **Estimate creation system** with professional templates and PDF generation
- PDF export with print-optimized output
- Auto-calculation of taxes, totals, and currency
- **Document status tracking** (draft, sent, paid, etc.)
- Multiple template system for all document types
- **Real-time Preview** with theme selection and live updates

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
- **Unified Dashboard Experience** with integrated creation forms
- **Enhanced Navigation** with home-linked branding on all pages
- **Advanced settings system** with notifications, preferences, privacy controls
- **Profile avatar system** with image upload, preview, and management
- **Streamlined Action Buttons** with comprehensive functionality
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- **Advanced loading states** and error handling with toast notifications

### 💼 **Advanced Business Features**
- **Customer management system** with detailed customer profiles
- **Estimate-to-invoice conversion** workflow
- Multiple template options (Template1-Template10)
- Premium service tiers with feature gating
- **Business settings configuration** (currency, tax rates, prefixes)
- **Document numbering system** with customizable prefixes

### 💾 **Supabase Database Integration**
- **Chat Storage**: All chat messages stored in Supabase with username (email) and first_name fields
- **Storage Bucket Required**: Create a 'chat-files' bucket for file/image uploads
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
### Chat Setup
1. Create a Supabase storage bucket named `chat-files` for file/image uploads
2. Ensure your `messages` table includes `username` (email) and `first_name` columns
3. Enable RLS and add policies for authenticated users to upload files
4. Admins can select users in the chat panel; users see only their own messages

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
│   │   ├── Login.jsx      # Authentication with home navigation
│   │   ├── AdminPage.jsx  # Admin dashboard
│   │   ├── Profile.jsx    # User profile page
│   │   ├── EditProfile.jsx # Profile editing
│   │   ├── Settings.jsx   # User settings
│   │   ├── Estimate.jsx   # Estimate creation
│   │   ├── Receipts.jsx   # Unified receipt system with dashboard & creation
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
│       ├── 20251007000001_add_status_to_receipts.sql
│       ├── 20251005000001_add_avatar_url_to_profiles.sql
│       ├── 20251003080000_fix_role_bootstrap.sql
│       └── ...            # Version-controlled schema changes
├── DATABASE_MIGRATION_GUIDE.md # Fresh database setup guide
├── AVATAR_DATABASE_SETUP.sql   # Avatar system setup
├── migration-backup.sql        # Database backup utilities
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
1. **Invoices**: Navigate to Template page for modern 2-column editing experience
   - **Left Column**: Comprehensive form with company details, customer info, and item management
   - **Right Column**: Live preview that updates in real-time as you type
   - **Advanced Features**: Add/edit/remove items with automatic calculations
   - **Preview Modes**: Toggle between edit mode and fullscreen preview mode
   - **Export Options**: Generate professional PDFs with optimized layouts
2. **Estimates**: Create professional estimates with conversion to invoices
3. **Receipts**: Enhanced unified receipt system with:
   - Inline creation within dashboard
   - Real-time preview with theme selection
   - Comprehensive action buttons (Save, Send, Download, Email, Print)
   - Status tracking (draft/sent) with visual indicators
   - Advanced search, filtering, and sorting capabilities
4. **Templates**: Choose from 10+ professional templates for all document types
5. **Dashboard Management**: 8-item pagination system with smart navigation
   - View exactly 8 invoices per page for optimal performance
   - Navigate with Previous/Next buttons and page indicators
   - Delete invoices with proper database handling

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

## 🎛️ Technical Specifications

### **Template Editor Architecture:**
- **Layout System**: CSS Grid-based 2-column responsive design
- **Live Preview**: React state synchronization with 0ms delay
- **Modal System**: Portal-based fullscreen modals with backdrop management
- **Scroll Navigation**: Horizontal scroll containers with A4 dimensions (210mm width)
- **Item Management**: Dynamic array manipulation with real-time calculations
- **Keyboard Shortcuts**: ESC key modal navigation, tab-based form navigation

### **Pagination System:**
- **Display Logic**: 8-item pages with intelligent slicing
- **Navigation**: Previous/Next with boundary handling
- **State Management**: URL-based page state persistence
- **Performance**: Optimized rendering with useMemo hooks
- **Responsive Design**: Mobile-friendly navigation controls

### **Performance Optimizations:**
- **React Optimization**: useCallback and useMemo for expensive operations
- **Database Queries**: Indexed database operations for fast pagination
- **Component Rendering**: Conditional rendering to minimize re-renders
- **Asset Loading**: Lazy loading for optimal bundle size
- **Memory Management**: Proper cleanup of event listeners and intervals

## � Database Schema & Migrations

### **Recent Database Upgrades (October 2025)**

SwiftFacture now includes a comprehensive migration system with the following recent enhancements:

#### **Receipt Status System** 📄
```sql
-- Added status tracking to receipts table
ALTER TABLE public.receipts 
ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent'));
```
- **Purpose**: Track receipt workflow (draft → sent)
- **Features**: Status validation, default values, performance indexes
- **UI Integration**: Visual status badges, filtered views

#### **Avatar System Enhancement** 👤
```sql
-- Enhanced user profiles with avatar support
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;
```
- **Purpose**: User profile customization
- **Features**: Image upload, preview, management
- **Storage**: Supabase Storage integration with validation

#### **Role Management Enhancement** 🔐
```sql
-- Enhanced role-based access control
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TABLE public.user_roles (/* comprehensive role system */);
```
- **Purpose**: Advanced user permission management
- **Features**: Hierarchical roles, bootstrap policies, security functions
- **Integration**: Complete admin dashboard with role management

#### **Performance Optimization** ⚡
- Strategic database indexes for improved query performance
- Optimized RLS policies for better security and speed
- Enhanced data validation and constraints

### **Migration Management**
- **Version Control**: All schema changes are versioned and tracked
- **Rollback Support**: Safe database updates with rollback capabilities
- **Fresh Setup**: Complete guide for new project database setup
- **Backup System**: Automated backup utilities for data protection

## �🔧 Configuration

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
The app uses Supabase with enhanced database schema:
- **Core Tables**: profiles (with avatar_url), customers, invoices, estimates, receipts (with status), user_roles, activity_logs
- **Advanced Features**: Receipt status tracking (draft/sent), user role management, activity logging
- **Performance**: Strategic database indexes for optimized queries
- **Security**: Comprehensive Row Level Security (RLS) policies with role-based access
- **Storage**: Avatar and document storage with validation and size limits
- **Migration System**: Complete versioned migration framework with rollback support
- **Fresh Setup**: DATABASE_MIGRATION_GUIDE.md for new project setup

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

### **Revolutionary Template Editor with 2-Column Layout** 🎨 *NEW*
- **Modern 2-Column Design**: Professional split-screen interface with form on left, live preview on right
- **Real-time Live Preview**: Instantly see changes as you type with dynamic form updates
- **2-Way Preview/Edit Mode**: Seamlessly switch between preview mode and edit mode with toggle button
- **Advanced Item Management**: Full CRUD operations for invoice items
  - Add new items with automatic numbering
  - Edit existing items inline
  - Remove items with confirmation
  - Real-time calculations and totals
- **Fullscreen Modal System**: Immersive fullscreen preview with:
  - Backdrop blur effect for focused viewing
  - Keyboard shortcuts (ESC to close)
  - Maximize/minimize toggle functionality
  - A4-optimized dimensions (210mm width)
- **Horizontal Scroll Navigation**: Smooth left/right scrolling for document sections
- **Complete Internationalization**: Full French/English support for all template features
- **Responsive Design**: Mobile-friendly with adaptive layouts

### **Enhanced Dashboard with Pagination System** 📊 *UPDATED*
- **8-Item Pagination**: Intelligent pagination displaying exactly 8 invoices per page
- **Smart Navigation Controls**: Previous/Next buttons with page counters
- **Fixed Delete Functionality**: Proper database ID handling for reliable deletions
- **Estimates Integration**: Seamless estimates display with flexible date field handling
- **Enhanced Charts**: 12-month analytics with improved data visualization
- **Status Management**: Complete invoice status tracking including "sent" status
- **Mobile-Responsive Pagination**: Optimized pagination controls for all screen sizes

### **Enhanced Receipt Management System** 📄 *UPDATED*
- **Unified Receipt Workflow**: Consolidated receipt system with single `/receipts` route
- **Inline Receipt Creation**: Create receipts directly within the dashboard view
- **Enhanced Action Buttons**: Complete action suite for receipt management
  - **Save as Draft** - Save receipts for later completion
  - **Send and Save Copy** - Mark receipts as sent and save
  - **Download PDF** - Export receipts as professional PDF documents
  - **Download PNG** - Export receipts as PNG images (coming soon)
  - **Send via Email** - Email receipts directly to customers with modal interface
  - **Print Receipt** - Direct browser printing with optimized layout
- **Real-time Preview**: Live receipt preview with theme selection
- **Status Tracking**: Track receipt status (draft/sent) with visual indicators
- **Comprehensive Dashboard**: Stats cards, filtering, search, and sorting capabilities

### **User Experience Improvements** 🎨 *UPDATED*
- **Revolutionary Template Interface**: Complete redesign with modern 2-column layout
- **Live Preview Technology**: Real-time form-to-preview synchronization
- **Advanced Modal System**: Fullscreen viewing with professional blur effects
- **Intelligent Pagination**: 8-item display with smart navigation controls
- **Enhanced Navigation**: Login page logo/title now links back to home
- **Streamlined UI**: Removed duplicate navigation elements for cleaner interface  
- **Improved Form Flow**: Integrated creation forms with dashboard views
- **Action Feedback**: Toast notifications for all user actions
- **Loading States**: Proper loading indicators for PDF generation and saving
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Keyboard Shortcuts**: ESC key support for modal navigation
- **Horizontal Scroll**: Smooth document section navigation

### **Authentication & User Management System** ✨
- Complete role-based access control (User, Admin, Super Admin)
- User profile management with avatar uploads
- Advanced admin dashboard with user management capabilities
- Password reset and account management features

### **Advanced Database & Backend** 🗄️
- **Enhanced PostgreSQL Schema**: Upgraded database with receipt status tracking, avatar support
- **Advanced Migration System**: Version-controlled database changes with rollback support
- **Performance Optimized**: Strategic indexes for improved query performance
- **Role-Based Security**: Enhanced user role policies with bootstrap functionality
- **Row Level Security (RLS)**: Comprehensive data protection policies
- **Real-time Synchronization**: Live data updates across all features
- **Secure File Storage**: Avatar and document storage with validation
- **Fresh Setup Support**: Complete documentation for new project setup

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

## � Changelog

### **v2.4.0** - October 2025 - *Production Ready* ⭐
**Major Receipt System Enhancement**
- ✅ **Unified Receipt Workflow**: Consolidated `/receipt` and `/receipts` routes into single efficient system
- ✅ **Enhanced Action Buttons**: Added comprehensive action suite
  - Save as Draft functionality
  - Send and Save Copy (updated from "Mark as Sent")
  - Download PDF with loading states
  - Download PNG (coming soon notification)
  - Send via Email with modal interface and success notifications
  - Print with browser-optimized layout
- ✅ **Navigation Improvements**: Login page logo/title now links to home
- ✅ **UI/UX Polish**: Removed duplicate create buttons, streamlined interface
- ✅ **Enhanced Error Handling**: Toast notifications for all actions
- ✅ **Real-time Preview**: Added `receipt-preview` class for PDF/print targeting
- ✅ **State Management**: Proper loading states and user feedback throughout

**Database Schema Upgrades** 🗄️
- ✅ **Receipt Status Tracking**: Added `status` field to receipts table (draft/sent)
- ✅ **Avatar Support**: Added `avatar_url` column to profiles table
- ✅ **Role Bootstrap Fix**: Enhanced user role assignment policies
- ✅ **Performance Optimization**: Added database indexes for better query performance
- ✅ **Migration System**: Complete database migration framework with versioning
- ✅ **Fresh Setup Guide**: Comprehensive documentation for new database setup

**Technical Improvements**
- Updated routing structure for better maintainability
- Enhanced icon imports (Download, Printer, FileImage, Check, Mail)
- Improved state management with proper cleanup
- Better error boundaries and user feedback systems
- Optimized component performance and rendering
- Advanced database migration system with proper rollback support

### **v2.0.0** - Previous Release
- Complete authentication system overhaul
- Admin dashboard and user management
- Supabase integration and database schema
- Multi-language support (French/English)
- Advanced business analytics and reporting

## �🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first styling approach
- **shadcn/ui** - For beautiful, accessible components
- **Supabase** - For the complete backend-as-a-service platform
- **Vercel** - For excellent deployment platform

---

**Made with ❤️ by Griffin250**

*SwiftFacture - Fast & Professional* 