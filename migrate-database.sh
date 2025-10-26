#!/bin/bash

# SwiftFacture Database Migration Script
# Run this after following the migration guide

echo "🚀 SwiftFacture Database Migration Script"
echo "========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the SwiftFacture root directory"
    exit 1
fi

echo "📋 Pre-migration checklist:"
echo "[ ] 1. Backed up data from old Supabase project"
echo "[ ] 2. Downloaded avatar files from storage"
echo "[ ] 3. Created new Supabase project"
echo "[ ] 4. Have new project credentials ready"
echo ""

read -p "Have you completed all pre-migration steps? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Please complete the pre-migration steps first!"
    exit 1
fi

echo ""
echo "🔧 Starting migration configuration..."

# Get new project details
read -p "Enter your NEW Supabase Project ID: " PROJECT_ID
read -p "Enter your NEW Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your NEW anon/public key: " ANON_KEY

# Validate inputs
if [ -z "$PROJECT_ID" ] || [ -z "$SUPABASE_URL" ] || [ -z "$ANON_KEY" ]; then
    echo "❌ Error: All fields are required"
    exit 1
fi

echo ""
echo "📝 Updating configuration files..."

# Update .env file
cat > .env << EOF
# SwiftFacture Environment Variables
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY

# Development settings
NODE_ENV=development
EOF

echo "✅ Updated .env file"

# Update supabase config
cat > supabase/config.toml << EOF
project_id = "$PROJECT_ID"
EOF

echo "✅ Updated supabase/config.toml"

echo ""
echo "🔄 Next steps:"
echo "1. Run: npx supabase link --project-ref $PROJECT_ID"
echo "2. Run: npx supabase db push (to apply migrations)"
echo "3. Import your backed-up data via Supabase dashboard"
echo "4. Upload avatar files to new storage bucket"
echo "5. Test the application"

echo ""
echo "✨ Configuration update complete!"
echo "📚 See DATABASE_MIGRATION_GUIDE.md for detailed next steps"