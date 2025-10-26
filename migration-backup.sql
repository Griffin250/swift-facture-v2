# 🚀 SwiftFacture Database Migration Script

# STEP 1: BACKUP CURRENT DATA (DO THIS FIRST!)
# Go to your OLD Supabase project dashboard and run these SQL commands to export data:

-- Create a backup of all your current data
SELECT 'Exporting profiles...' as status;
COPY (SELECT * FROM profiles) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting customers...' as status;
COPY (SELECT * FROM customers) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting invoices...' as status;
COPY (SELECT * FROM invoices) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting invoice_items...' as status;
COPY (SELECT * FROM invoice_items) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting estimates...' as status;
COPY (SELECT * FROM estimates) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting estimate_items...' as status;
COPY (SELECT * FROM estimate_items) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting receipts...' as status;
COPY (SELECT * FROM receipts) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting receipt_items...' as status;
COPY (SELECT * FROM receipt_items) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting user_settings...' as status;
COPY (SELECT * FROM user_settings) TO STDOUT WITH CSV HEADER;

SELECT 'Exporting user_roles...' as status;
COPY (SELECT * FROM user_roles) TO STDOUT WITH CSV HEADER;

# STEP 2: DOWNLOAD STORAGE FILES
# 1. Go to Storage → avatars bucket in old project
# 2. Download all files
# 3. Save them to migrate to new bucket

# STEP 3: UPDATE PROJECT CREDENTIALS
# Replace these with your NEW Supabase project details:

# OLD PROJECT: kvvqkzwrkselznrnqcbi.supabase.co
# NEW PROJECT: [your-new-project-id].supabase.co