# 📊 SwiftFacture Database Architecture Documentation

## Overview
SwiftFacture utilizes a comprehensive Supabase PostgreSQL database with **21 core tables** implementing a robust invoicing, subscription, and user management system. The database architecture supports multi-tenant operations, role-based access control, and advanced business features.

---

## 🏗️ Database Setup & Migration System

### **Migration Framework**
- **Location**: `supabase/migrations/` folder with timestamped SQL files
- **Version Control**: Sequential migrations with rollback support
- **Setup Script**: `migrate-database.sh` for automated project setup
- **Fresh Setup Guide**: `DATABASE_MIGRATION_GUIDE.md` for new installations

### **Key Migration Files**
1. `20251001190627_094c1b79...sql` - **Base Schema** (profiles, customers, invoices)
2. `20251002043623_ee8ea3c2...sql` - **Extended Tables** (items, payments, settings)
3. `20251003024401_2aaad683...sql` - **Role System** (user_roles, permissions)
4. `20251007000002_add_trial_system.sql` - **Billing System** (organizations, subscriptions)
5. `20251026110000_add_missing_plans_columns.sql` - **Plans Enhancement**

---

## 📋 Core Tables (21 Tables Total)

### **1. 👤 User Management Tables**

#### **`profiles`** - User Profile Information
- **Purpose**: Extended user data beyond Supabase auth
- **Key Fields**: `id` (UUID, links to auth.users), `email`, `first_name`, `last_name`, `company_name`, `avatar_url`
- **Creation**: Base migration - handles new user signup via trigger
- **Function**: Central user profile with avatar support and company details
- **RLS**: Users view/edit own profile, admins view all

#### **`user_roles`** - Role-Based Access Control
- **Purpose**: Multi-level permission system
- **Key Fields**: `user_id`, `role` (enum: user/admin/super_admin)
- **Creation**: Role system migration with security definer functions
- **Function**: Implements hierarchical access control across the application
- **RLS**: Users view own roles, super_admins manage all roles

#### **`user_settings`** - User Preferences & Configuration
- **Purpose**: Personalized application settings
- **Key Fields**: `user_id`, `language`, `timezone`, `default_currency`, `date_format`, template prefixes
- **Creation**: Extended tables migration
- **Function**: Stores user preferences for localization and document generation
- **RLS**: Users manage their own settings

---

### **2. 🏢 Organization & Billing Tables**

#### **`organizations`** - Multi-Tenant Organization Structure
- **Purpose**: Support for team/company workspaces
- **Key Fields**: `id`, `name`, `slug`, `owner_id`
- **Creation**: Trial system migration
- **Function**: Enables multi-user organizations with shared resources
- **RLS**: Members view their organization, owners manage

#### **`org_members`** - Organization Membership
- **Purpose**: Link users to organizations with roles
- **Key Fields**: `organization_id`, `user_id`, `role` (owner/admin/member)
- **Creation**: Trial system migration
- **Function**: Manages organization membership and permissions
- **RLS**: Organization members view membership

#### **`plans`** - Subscription Plans Configuration
- **Purpose**: Define available subscription tiers
- **Key Fields**: `id`, `name_en/fr`, `price_monthly/yearly`, `features` (JSON), Stripe IDs
- **Creation**: Trial system + enhancement migrations
- **Function**: Configurable subscription plans with feature limits and Stripe integration
- **RLS**: Public read access for plan selection

#### **`billing_subscriptions`** - Active Subscriptions
- **Purpose**: Track organization subscription status
- **Key Fields**: `organization_id`, `plan_id`, `status`, trial dates, Stripe customer ID
- **Creation**: Trial system migration
- **Function**: Manages subscription lifecycle and billing status
- **RLS**: Organization owners view subscription details

#### **`billing_events`** - Billing History & Audit Trail
- **Purpose**: Log all billing-related events
- **Key Fields**: `organization_id`, `event_type`, `event_data` (JSON), `processed_at`
- **Creation**: Trial system migration
- **Function**: Comprehensive billing audit trail for debugging and reporting
- **RLS**: Organization owners view billing events

---

### **3. 👥 Customer Management Tables**

#### **`customers`** - Customer Database
- **Purpose**: Store client/customer information
- **Key Fields**: `id`, `user_id`, `name`, `email`, `phone`, address fields
- **Creation**: Base migration with user relationship
- **Function**: Central customer registry for invoice/estimate recipients
- **RLS**: Users manage their own customers
- **Enhancement**: Extended with enhanced customer fields in later migration

---

### **4. 📄 Document Management Tables**

#### **`invoices`** - Invoice Documents
- **Purpose**: Core invoice management
- **Key Fields**: `id`, `user_id`, `customer_id`, `invoice_number`, dates, amounts, `status`, `template_name`
- **Creation**: Base migration with customer relationship
- **Function**: Main invoice tracking with status management and template support
- **RLS**: Users manage own invoices, admins view all

#### **`invoice_items`** - Invoice Line Items
- **Purpose**: Detailed invoice item breakdown
- **Key Fields**: `invoice_id`, `description`, `quantity`, `unit_price`, `tax_rate`, `total`, `sort_order`
- **Creation**: Extended tables migration
- **Function**: Flexible invoice line items with tax calculation and sorting
- **RLS**: Users manage items for their invoices

#### **`estimates`** - Quote/Estimate Documents
- **Purpose**: Pre-sale estimate management
- **Key Fields**: Similar to invoices plus `expiry_date`
- **Creation**: Extended tables migration
- **Function**: Generate estimates that can convert to invoices
- **RLS**: Users manage own estimates

#### **`estimate_items`** - Estimate Line Items
- **Purpose**: Detailed estimate breakdown
- **Key Fields**: Mirrors invoice_items structure
- **Creation**: Extended tables migration
- **Function**: Line-by-line estimate details with conversion capability
- **RLS**: Users manage items for their estimates

#### **`receipts`** - Receipt Documents
- **Purpose**: Payment receipt tracking
- **Key Fields**: `receipt_number`, `date`, `payment_method`, amounts, `status`
- **Creation**: Extended tables migration + status enhancement
- **Function**: Generate receipts for completed payments with status tracking
- **RLS**: Users manage own receipts

#### **`receipt_items`** - Receipt Line Items
- **Purpose**: Detailed receipt breakdown
- **Key Fields**: Similar to invoice/estimate items
- **Creation**: Extended tables migration
- **Function**: Itemized receipts for detailed payment records
- **RLS**: Users manage items for their receipts

---

### **5. 💰 Payment & Financial Tables**

#### **`payments`** - Payment Records
- **Purpose**: Track payment transactions
- **Key Fields**: `customer_id`, `invoice_id`, `amount`, `payment_date`, `payment_method`, `transaction_id`, `status`
- **Creation**: Extended tables migration
- **Function**: Link payments to invoices with transaction tracking
- **RLS**: Users view payments for their invoices

---

### **6. 🔔 Communication & Logging Tables**

#### **`notifications`** - In-App Notifications
- **Purpose**: User notification system
- **Key Fields**: `user_id`, `title`, `message`, `type`, `read` status, `link`
- **Creation**: Extended tables migration
- **Function**: Delivers system notifications and alerts to users
- **RLS**: Users view their own notifications

#### **`activity_logs`** - System Activity Tracking
- **Purpose**: Comprehensive audit logging
- **Key Fields**: `user_id`, `action`, `entity_type`, `entity_id`, `details` (JSON), `ip_address`, `user_agent`
- **Creation**: Extended tables migration
- **Function**: Security and compliance audit trail for all user actions
- **RLS**: Users view own activity, admins view all

#### **`email_logs`** - Email Delivery Tracking
- **Purpose**: Track email communications
- **Key Fields**: `user_id`, `email_type`, `recipient`, `status`, `sent_at`, `error_message`
- **Creation**: Trial system migration
- **Function**: Monitor email delivery success/failure for invoices and notifications
- **RLS**: Users view their email logs

---

## 🔐 Security Features

### **Row Level Security (RLS)**
- **Implementation**: All tables have comprehensive RLS policies
- **User Isolation**: Users can only access their own data
- **Admin Access**: Hierarchical access based on user roles
- **Multi-Tenant**: Organization-based access control where applicable

### **Role-Based Access Control**
- **User**: Basic access to own documents and features
- **Admin**: View all users and documents, basic management
- **Super Admin**: Full system access, user management, system settings

### **Security Functions**
- `has_role(_user_id, _role)` - Check user permissions
- `get_user_role(_user_id)` - Get user's highest role
- Automatic role assignment for new users

---

## 📊 Storage & Assets

### **Avatar Storage Bucket**
- **Purpose**: User profile images
- **Location**: `storage.buckets` (avatars bucket)
- **Security**: Users upload/manage own avatars
- **Limits**: 5MB max, image formats only
- **Public Access**: Avatar images publicly accessible

---

## 🔧 Database Functions & Triggers

### **Utility Functions**
- `update_updated_at_column()` - Auto-update timestamps
- `handle_new_user()` - Create profile on signup
- `handle_new_user_role()` - Assign default role

### **Automatic Triggers**
- **Updated At**: All tables auto-update `updated_at` field
- **User Creation**: Auto-create profile and assign user role
- **Referential Integrity**: Proper foreign key relationships with cascade deletes

---

## 🚀 Performance Optimizations

### **Strategic Indexes**
- User-based queries (user_id indexes on all user tables)
- Organization-based access patterns
- Document number lookups
- Date-based queries for billing
- Role-based access optimization

### **Query Optimization**
- RLS policies optimized for user isolation
- Efficient joins between related tables
- Proper foreign key relationships

---

## 🔄 Migration & Maintenance

### **Version Control**
- **Sequential Migrations**: Timestamped SQL files
- **Rollback Support**: Each migration can be reversed
- **Environment Sync**: Consistent across dev/staging/prod

### **Data Recovery**
- **Backup Scripts**: `migration-backup.sql` utilities
- **Safe Recovery**: `20251026130000_safe_data_recovery.sql`
- **Fresh Setup**: Automated setup for new environments

---

## 📈 Scalability Features

### **Multi-Tenant Architecture**
- Organization-based resource isolation
- Efficient data partitioning by user/organization
- Horizontal scaling ready

### **Business Growth Support**
- Flexible subscription plans with feature limits
- Comprehensive billing and trial system
- Usage tracking and limits enforcement

---

## 🛡️ Compliance & Audit

### **Data Protection**
- Complete audit trail via activity_logs
- User data isolation via RLS
- Secure data deletion with CASCADE relationships

### **Business Intelligence**
- Comprehensive logging for analytics
- Billing events for revenue tracking
- User activity monitoring for insights

---

This database architecture provides a solid foundation for SwiftFacture's invoicing platform, supporting everything from basic document generation to advanced multi-tenant SaaS operations with comprehensive billing, security, and audit capabilities.