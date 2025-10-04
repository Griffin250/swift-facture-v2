# SwiftFacture Email Template Customization Instructions

## Overview
This document provides instructions for customizing the Supabase email templates to reflect SwiftFacture branding instead of the default "billify-generator-80271" project name.

## Steps to Customize Email Templates

### 1. Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `kvvqkzwrkselznrnqcbi`
3. Go to **Authentication** → **Settings** → **Email Templates**

### 2. Update Confirmation Email Template

Replace the default template with the following custom HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your SwiftFacture account</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo {
            display: inline-block;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            border-radius: 50%;
            color: white;
            font-size: 24px;
            font-weight: bold;
            line-height: 60px;
            margin-bottom: 16px;
        }
        .brand-name {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
        }
        .tagline {
            color: #6b7280;
            font-size: 14px;
            margin: 4px 0 0 0;
        }
        .content {
            text-align: center;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 16px 0;
        }
        .description {
            color: #4b5563;
            margin-bottom: 32px;
            font-size: 16px;
        }
        .email-address {
            background: #f3f4f6;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 14px;
            color: #1f2937;
            margin: 16px 0 32px 0;
            border: 1px solid #e5e7eb;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s;
        }
        .verify-button:hover {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
        }
        .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 0 0 16px 0;
        }
        .support-link {
            color: #3b82f6;
            text-decoration: none;
            font-size: 14px;
        }
        .support-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">S</div>
            <h1 class="brand-name">SwiftFacture</h1>
            <p class="tagline">Professional Invoice Generator</p>
        </div>
        
        <div class="content">
            <h2 class="title">Confirm Your Email Address</h2>
            <p class="description">
                Thanks for signing up for SwiftFacture! Please confirm your email address to get started with creating professional invoices and receipts.
            </p>
            
            <div class="email-address">{{ .Email }}</div>
            
            <a href="{{ .ConfirmationURL }}" class="verify-button">
                Verify Email Address
            </a>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                If you didn't create a SwiftFacture account, you can safely ignore this email.
            </p>
            <a href="mailto:support@swiftfacture.com" class="support-link">
                Need help? Contact Support
            </a>
        </div>
    </div>
</body>
</html>
```

### 3. Update Other Email Templates

Apply similar branding to:
- **Magic Link Email**
- **Change Email Address**  
- **Reset Password**

### 4. Configure Email Settings

In **Authentication** → **Settings**:

1. **Site URL**: `https://swiftfacture.com`
2. **Additional Redirect URLs**: 
   - `https://swiftfacture.com/auth/verify`
   - `https://swiftfacture.com/`
3. **Email Rate Limiting**: Configure as needed

### 5. SMTP Configuration (Optional)

For custom SMTP (recommended for production):

1. Go to **Settings** → **Authentication** → **Email**
2. Enable **Use custom SMTP server**
3. Configure with your domain's SMTP settings:
   - Host: Your SMTP host
   - Port: 587 (TLS) or 465 (SSL)  
   - Username: Your SMTP username
   - Password: Your SMTP password
   - Sender email: `noreply@swiftfacture.com`
   - Sender name: `SwiftFacture`

## Email Template Variables

Available variables you can use:
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email verification link
- `{{ .RedirectTo }}` - Redirect URL after confirmation
- `{{ .Token }}` - Verification token
- `{{ .SiteURL }}` - Your site URL

## Testing

After making changes:
1. Test email delivery with a new user registration
2. Verify the email looks correct in different email clients
3. Ensure the verification flow works end-to-end

## Notes

- Changes may take a few minutes to propagate
- Always test in a staging environment first
- Keep backup copies of working templates
- Monitor email delivery rates after changes

## Support

If you need assistance with email template customization:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- Contact Supabase support for technical issues
- Email configuration issues can be debugged in the Supabase logs