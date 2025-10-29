# 🚀 SwiftFacture Fresh Database Setup Guide

This guide will help you set up a brand new SwiftFacture database in your new Supabase project with the same structure and components as the original, starting fresh without migrating old data.

## ⚠️ IMPORTANT: Fresh Setup Checklist

### **Step 1: Get NEW Supabase Project Credentials**

From your NEW Supabase project dashboard:
1. Go to Settings → API
2. Copy these values:
   - **Project URL**: `https://[new-project-id].supabase.co`
   - **anon public key**: `<YOUR_ANON_KEY>` (long key)
   - **service_role key**: `<YOUR_SERVICE_ROLE_KEY>` (keep secret!)

---

### **Step 2: Update SwiftFacture Configuration**

#### Update Environment Variables
Create/update `.env` file in your project root:

```env
# Replace with your NEW project credentials
VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-new-anon-key

# Optional: Add service role for admin operations
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
```

#### Update Supabase Config
Update `supabase/config.toml`:

```toml
project_id = "your-new-project-id"
```

---

### **Step 3: Set Up Fresh Database Schema**

#### Option A: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the SwiftFacture directory
cd d:\SwiftFacture

# Link to your new project
npx supabase link --project-ref <YOUR_PROJECT_ID>

# Push all migrations to create the database structure
npx supabase db push
```

#### Option B: Manual SQL Migration
If CLI doesn't work, run these migration files in your NEW project SQL Editor in this exact order:

1. **Base Schema Migration**:
```sql
-- Copy and run the entire content of: supabase/migrations/20251001190627_094c1b79-dc3a-4648-91c9-e8df7cfdf334.sql
```

2. **Fixes Migration**:
```sql
-- Copy and run: supabase/migrations/20251001190737_3d045aff-882b-4f9a-8bdd-ae8e15da3f98.sql
```

3. **Additional Tables Migration**:
```sql
-- Copy and run: supabase/migrations/20251002043623_ee8ea3c2-20f5-42c7-8393-4dc0921e4f5e.sql
```

4. **Roles Migration**:
```sql
-- Copy and run: supabase/migrations/20251003024401_2aaad683-bf5c-4ad9-9690-8e01cb03fa3f.sql
```

5. **Role Fix Migration**:
```sql
-- Copy and run: supabase/migrations/20251003080000_fix_role_bootstrap.sql
```

6. **Avatar Support Migration**:
```sql
-- Copy and run: supabase/migrations/20251005000001_add_avatar_url_to_profiles.sql
```

#### Verify Schema Creation
After running migrations, verify all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- customers, estimates, estimate_items, invoices, invoice_items, profiles, receipts, receipt_items, user_roles, user_settings

---

### **Step 4: Set Up Storage Buckets**

#### Create Avatar Bucket
1. Go to Storage in your NEW Supabase project
2. Create new bucket named `avatars`
3. Set bucket as Public
4. Set correct RLS policies by running this in SQL Editor:

```sql
-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### **Step 5: Configure Authentication Settings**

#### Configure Auth Settings
1. Go to Authentication → Settings in your NEW project
2. Configure these settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email Auth**: Enable if you want email/password registration
   - **Social Providers**: Enable any providers you want (Google, GitHub, etc.)
   - **Email Templates**: Customize registration/reset emails as needed

#### Test User Creation
1. Try creating a new account through your SwiftFacture app
2. Verify user appears in auth.users table and profiles table gets populated
3. Test login/logout functionality

---

### **Step 6: Test Your Fresh Setup**

#### Fresh Database Testing Checklist:
- [ ] User registration works and creates profile automatically
- [ ] User login works  
- [ ] Dashboard loads properly (will be empty - that's normal!)
- [ ] Customer creation/editing works
- [ ] Invoice creation works with database persistence
- [ ] Avatar upload works
- [ ] User settings save properly
- [ ] All tables are created and accessible

#### Quick Verification Commands:
```sql
-- Verify database structure is set up correctly
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- After creating a test user, verify profile creation
SELECT * FROM profiles LIMIT 5;
```

---

### **Step 7: Start Using Your Fresh Database**

🎉 **Your fresh SwiftFacture database is ready!**

You now have:
- ✅ Complete database schema with all tables
- ✅ Working authentication system
- ✅ Avatar storage functionality  
- ✅ All RLS policies in place
- ✅ Clean, empty database ready for new data

#### Next Steps:
1. Create your first user account
2. Set up your company profile
3. Add your first customers
4. Create your first invoices
5. Customize settings as needed

---

## 🚀 **Setup Complete!**

Your SwiftFacture app is now running on a fresh Supabase database with the same structure as before, ready for new data!

## ⚠️ **Troubleshooting**

### Common Issues:
1. **406 Errors**: Usually means migrations didn't run completely - verify all tables exist
2. **Auth Issues**: Double-check environment variables in your `.env` file
3. **Storage Issues**: Make sure avatars bucket exists and is set to Public
4. **Connection Issues**: Verify project URL and API keys are correct

### Quick Fixes:
- **Can't connect**: Check if VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are correct
- **Tables missing**: Re-run the migrations in order
- **Avatar upload fails**: Verify avatars bucket exists and policies are set
- **Registration fails**: Check if profiles table and auth triggers are working

### Need Help?
- Check Supabase logs in Dashboard → Logs
- Verify table structure with the SQL commands above
- Test individual features one by one
- Check browser console for specific error messages