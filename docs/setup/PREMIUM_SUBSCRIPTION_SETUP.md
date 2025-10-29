# Premium Subscription Setup Guide

## Overview
This guide explains the complete Premium Subscription system integrated with Stripe for SwiftFacture.

## 🎯 Features Implemented

### 1. **Stripe Integration**
- ✅ Automated subscription management
- ✅ Secure payment processing
- ✅ Customer portal for self-service management
- ✅ Multiple subscription tiers (Starter, Professional, Enterprise)

### 2. **Database Schema**
- ✅ `plans` table with subscription details
- ✅ Integration with existing `billing_subscriptions` table
- ✅ Row Level Security (RLS) policies configured

### 3. **Edge Functions**
- ✅ `create-checkout`: Stripe checkout session creation
- ✅ `check-subscription`: Real-time subscription status verification
- ✅ `customer-portal`: Stripe customer portal access

## 📋 Subscription Plans

### Stripe Products Created:
1. **SwiftFacture Starter** (€19.99/month)
   - Product ID: `prod_TJ1FKRu0auL1vc`
   - Price ID: `price_1SMPD4RogxYobEmxWT7P4zDG`
   - Features: 30 customers, unlimited invoices, 36 premium deliveries

2. **SwiftFacture Professional** (€39.99/month)
   - Product ID: `prod_TJ1G4VS7ciOI3T`
   - Price ID: `price_1SMPDVRogxYobEmx01OzT5DG`
   - Features: Unlimited customers, 120 premium deliveries, priority support

3. **SwiftFacture Enterprise** (€79.99/month)
   - Product ID: `prod_TJ1G5mWJ9P8lXH`
   - Price ID: `price_1SMPDeRogxYobEmxIFqkLJK4`
   - Features: Everything + custom branding, dedicated support, 360 deliveries

## 🚀 Setup Instructions

### Step 1: Stripe Configuration

1. **Enable Stripe Customer Portal**:
   - Visit: https://dashboard.stripe.com/settings/billing/portal
   - Enable the customer portal
   - Configure cancellation settings, payment method updates, etc.

2. **Verify Products & Prices**:
   ```bash
   # All products and prices have been created automatically
   # Verify in Stripe Dashboard: https://dashboard.stripe.com/products
   ```

### Step 2: Database Migration

The database migration has been completed automatically with:
```sql
-- Plans table created
-- RLS policies configured
-- Initial plan data inserted (Free, Starter, Professional, Enterprise)
```

### Step 3: Edge Functions Deployment

All edge functions are deployed automatically:
- `create-checkout`: Creates Stripe checkout sessions
- `check-subscription`: Verifies subscription status
- `customer-portal`: Opens Stripe billing portal

### Step 4: Frontend Integration

#### Premium Page (`/premium`)
- Displays all available plans from database
- Shows current subscription status
- Initiates Stripe checkout when user selects a plan
- Opens checkout in new tab for seamless experience

#### Billing Page (`/billing`)
- Displays current subscription details
- Shows trial status if applicable
- Provides "Manage Subscription" button
- Opens Stripe Customer Portal for self-service

## 💻 Usage Flow

### For New Users:
1. User visits `/premium` page
2. Selects a subscription plan
3. Redirected to Stripe Checkout
4. Completes payment
5. Redirected back to `/billing?success=true`
6. Subscription activated automatically

### For Existing Subscribers:
1. User visits `/billing` page
2. Views current subscription details
3. Clicks "Manage Subscription"
4. Stripe Customer Portal opens in new tab
5. Can update payment method, cancel, or upgrade

## 🔧 API Reference

### SubscriptionService

```javascript
import SubscriptionService from '@/services/subscriptionService';

// Check subscription status
const status = await SubscriptionService.checkSubscription();
// Returns: { success, subscribed, plan_id, product_id, subscription_end }

// Create checkout session
const checkout = await SubscriptionService.createCheckout(priceId, planId);
// Returns: { success, url, session_id }

// Open customer portal
const portal = await SubscriptionService.openCustomerPortal();
// Returns: { success, url }

// Get all plans
const plans = await SubscriptionService.getPlans();
// Returns: { success, plans: [...] }
```

## 🔐 Security Notes

1. **Stripe Keys**: 
   - Secret key stored securely in Lovable Cloud environment
   - Never exposed to frontend
   - Used only in edge functions

2. **RLS Policies**:
   - Plans table: Anyone can read, only admins can modify
   - Subscriptions verified server-side via Stripe API

3. **Authentication**:
   - All edge functions require authentication
   - User verification via Supabase JWT tokens

## 🧪 Testing

### Test Mode:
Currently using Stripe test mode. To test:
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC code

### Production Mode:
To switch to production:
1. Update Stripe secret key in Lovable Cloud settings
2. Use production Stripe product/price IDs
3. Update environment variables if needed

## 📊 Monitoring

### Admin Dashboard Updates:
- Real-time subscription metrics
- User distribution by plan
- Revenue tracking
- Trial conversion rates

### Stripe Dashboard:
- Monitor all payments and subscriptions
- View customer details
- Handle disputes
- Generate reports

## 🆘 Troubleshooting

### Issue: Checkout not opening
**Solution**: Verify Stripe secret key is configured correctly

### Issue: Subscription not showing after payment
**Solution**: 
1. Check edge function logs
2. Verify Stripe webhook events
3. Check product/price ID mapping

### Issue: Customer portal not working
**Solution**: Ensure Stripe Customer Portal is enabled in dashboard

## 🔄 Future Enhancements

Potential improvements:
1. **Webhooks**: Implement Stripe webhooks for instant status updates
2. **Invoice History**: Display past invoices from Stripe
3. **Usage Tracking**: Monitor feature usage per plan
4. **Proration**: Handle mid-cycle plan changes
5. **Annual Billing**: Add yearly payment options with discount

## 📝 Important Notes

1. **No Webhooks Yet**: Current implementation uses edge functions to check subscription status. Webhooks can be added for real-time updates.

2. **Product ID Mapping**: The system maps Stripe product IDs to internal plan IDs:
   ```javascript
   {
     'prod_TJ1FKRu0auL1vc': 'starter',
     'prod_TJ1G4VS7ciOI3T': 'professional',
     'prod_TJ1G5mWJ9P8lXH': 'enterprise'
   }
   ```

3. **Free Plan**: Free plan doesn't require Stripe integration, handled via trial system.

4. **Trial System**: Existing 30-day trial system works alongside paid subscriptions.

## 🎓 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Customer Portal Guide](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [SwiftFacture Trial System](./TRIAL_SUBSCRIPTION_SETUP.md)

## ✅ Completion Checklist

- [x] Stripe integration enabled
- [x] Products and prices created
- [x] Database migration completed
- [x] Edge functions deployed
- [x] Premium page updated
- [x] Billing page updated
- [x] Subscription service created
- [x] Admin dashboard updated
- [ ] Stripe Customer Portal configured (user action required)
- [ ] Test complete subscription flow
- [ ] Switch to production mode when ready

---

**Last Updated**: January 2025
**Version**: 1.0
