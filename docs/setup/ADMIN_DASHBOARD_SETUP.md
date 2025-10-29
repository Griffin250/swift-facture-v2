# Admin Dashboard Setup Guide

## Overview
This guide explains the Admin Dashboard system for SwiftFacture with real-time data integration.

## 🎯 Features Implemented

### 1. **Dashboard Panels**
- ✅ Main Dashboard with metrics and charts
- ✅ Users Management Panel
- ✅ Organizations Panel
- ✅ Subscriptions & Trials Panel
- ✅ Documents Management
- ✅ Clients Management
- ✅ Support System
- ✅ Monitoring Page
- ✅ Settings Panel
- ✅ Database Management

### 2. **Real-Time Metrics**
- ✅ Total Users count
- ✅ Total Customers count
- ✅ Active Trials tracking
- ✅ Revenue monitoring
- ✅ Recent Activity feed
- ✅ User distribution charts
- ✅ Monthly comparisons

### 3. **Charts & Analytics**
- ✅ Revenue trend line chart (real data)
- ✅ User distribution doughnut chart (real data)
- ✅ Monthly comparison bar chart (real data)
- ✅ All charts use live database data

## 📊 Dashboard Components

### Main Dashboard (`AdminDashboardPanel`)

#### Metrics Cards:
1. **Total Users**
   - Shows count from `profiles` table
   - Displays trend indicator
   - Updates in real-time

2. **Total Customers**
   - Shows count from `customers` table
   - Includes percentage change
   - Business intelligence metric

3. **Active Trials**
   - Shows count from `billing_subscriptions`
   - Filters by status 'trialing'
   - Critical for conversion tracking

4. **Total Revenue**
   - Calculated from subscription data
   - Shows in EUR currency
   - Trend indicator included

#### Charts:
1. **Revenue Trend**
   - Line chart showing monthly revenue
   - Currently displays current month's total
   - Future: Will show historical monthly data

2. **User Distribution**
   - Doughnut chart showing user types
   - Free users vs Trial users vs Premium users
   - Real-time calculation from database

3. **Monthly Comparison**
   - Bar chart comparing metrics month-over-month
   - New users and active trials
   - Currently shows current month data

### Trial Management Panel (`AdminTrialPanel`)

#### Stats Cards:
- Active Trials count
- Expiring Soon (within 7 days)
- Monthly Conversions
- Conversion Rate percentage

#### Features:
- View all active trials
- See days remaining for each trial
- Trial status indicators
- Quick actions panel
- Refresh data button
- Export functionality (placeholder)

#### Trial Table:
- Organization name
- Trial end date
- Days remaining with color coding
- Status badge
- Action buttons (Details, Send Reminder)

## 🔧 Admin Service

### `adminAnalyticsService`

```javascript
// Get dashboard metrics
const metrics = await adminAnalyticsService.getDashboardMetrics();
// Returns: { totalUsers, totalCustomers, activeTrials, totalRevenue }

// Get recent activity
const activity = await adminAnalyticsService.getRecentActivity(limit);
// Returns: Array of recent user actions

// Get trial statistics
const trialStats = await TrialService.getTrialStats();
// Returns: { activeTrials, expiringSoon, monthlyConversions, trials }
```

## 🚀 Data Sources

### Database Tables Used:

1. **profiles** - User accounts
   ```sql
   SELECT COUNT(*) FROM profiles;
   ```

2. **customers** - Business customers
   ```sql
   SELECT COUNT(*) FROM customers;
   ```

3. **billing_subscriptions** - Subscription data
   ```sql
   SELECT COUNT(*) FROM billing_subscriptions 
   WHERE status = 'trialing';
   ```

4. **activity_logs** - User activity tracking
   ```sql
   SELECT * FROM activity_logs 
   ORDER BY created_at DESC LIMIT 10;
   ```

5. **invoices** - Invoice totals for revenue
   ```sql
   SELECT SUM(total) FROM invoices 
   WHERE status = 'paid';
   ```

## 🎨 UI Components

### Color Scheme:
- **Blue** (`#3B82F6`): Primary actions, users
- **Orange** (`#F97316`): Trials, warnings
- **Green** (`#22C55E`): Success, revenue
- **Red** (`#EF4444`): Errors, critical items
- **Purple**: Enterprise features

### Status Indicators:
- 🟢 **Green**: Active, healthy status
- 🟡 **Yellow**: Warning, 3-7 days left
- 🟠 **Orange**: Urgent, 1-2 days left  
- 🔴 **Red**: Critical, last day

### Charts Library:
Using **Chart.js** with **react-chartjs-2**:
- Smooth animations (2000ms)
- Responsive design
- Interactive tooltips
- Color-coded datasets
- Custom styling

## 📈 Metrics Calculation

### Total Revenue Calculation:
```javascript
// Sum all paid invoices
const { data: invoices } = await supabase
  .from('invoices')
  .select('total')
  .eq('status', 'paid');

const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
```

### Active Trials Calculation:
```javascript
// Count trialing subscriptions
const { count } = await supabase
  .from('billing_subscriptions')
  .select('*', { count: 'exact' })
  .eq('status', 'trialing')
  .gt('trial_end', new Date().toISOString());
```

### User Distribution:
```javascript
// Free users = Total users - Active trials
// Trial users = Active trials count
// Premium users = Active paid subscriptions count
```

## 🔐 Security & Access Control

### Role-Based Access:
- **Super Admin**: Full access to all panels
- **Admin**: Access to most panels, limited database access
- **User**: No admin panel access

### RLS Policies:
- Admin functions require `has_role()` check
- Database operations filtered by user role
- Activity logs track all admin actions

### Protected Routes:
```javascript
<AdminRoute>
  <AdminPage />
</AdminRoute>
```

## 🧪 Testing Admin Features

### As Super Admin:
1. Navigate to `/admin`
2. View dashboard metrics
3. Check all charts load correctly
4. Verify real data displays
5. Test trial panel functions
6. Check activity logs

### Test Data:
```javascript
// Create test users
// Create test subscriptions
// Create test customers
// Generate test activity
```

## 📊 Admin Dashboard Pages

### Navigation Structure:
```
/admin
  ├─ dashboard (default)
  ├─ users
  ├─ organizations
  ├─ subscriptions
  ├─ documents
  ├─ clients
  ├─ support
  ├─ monitoring
  ├─ settings
  ├─ account
  └─ database
```

### Sidebar Navigation:
- Collapsible sidebar
- Icons for each section
- Active page highlighting
- Responsive design
- Dark mode support

## 🔄 Real-Time Updates

### Current Implementation:
- Manual refresh buttons
- Load data on component mount
- Refresh on page navigation

### Future Enhancements:
1. **WebSocket Integration**:
   - Real-time metric updates
   - Live activity feed
   - Instant chart updates

2. **Polling**:
   - Auto-refresh every 30 seconds
   - Background data sync
   - User-configurable intervals

3. **Notifications**:
   - New user alerts
   - Trial expiry warnings
   - Revenue milestones

## 🆘 Troubleshooting

### Issue: Metrics show 0
**Solution**: 
1. Check database connection
2. Verify RLS policies
3. Check admin role assignment

### Issue: Charts not displaying
**Solution**:
1. Verify Chart.js import
2. Check data format
3. Inspect browser console

### Issue: Permission denied
**Solution**:
1. Verify user has admin role
2. Check RLS policies
3. Review activity logs

## 📝 Future Enhancements

### Planned Features:
1. **Advanced Filtering**:
   - Date range selectors
   - Status filters
   - Search functionality

2. **Export Functionality**:
   - CSV export for all tables
   - PDF reports generation
   - Scheduled reports

3. **Bulk Operations**:
   - Bulk user actions
   - Bulk email sending
   - Batch updates

4. **Advanced Analytics**:
   - Cohort analysis
   - Funnel visualization
   - Retention metrics
   - Revenue forecasting

5. **Activity Monitoring**:
   - Real-time user tracking
   - System health dashboard
   - Performance metrics

## 🎓 Admin Best Practices

1. **Regular Monitoring**:
   - Check dashboard daily
   - Review trial expiries
   - Monitor revenue trends

2. **User Management**:
   - Respond to support tickets
   - Review user feedback
   - Track user engagement

3. **Data Analysis**:
   - Analyze conversion rates
   - Identify growth patterns
   - Optimize pricing

4. **System Maintenance**:
   - Regular database cleanup
   - Performance optimization
   - Security audits

## ✅ Admin Dashboard Checklist

- [x] Main dashboard with real metrics
- [x] User management panel
- [x] Trial management panel
- [x] Real-time charts
- [x] Activity logging
- [x] Role-based access control
- [x] Responsive design
- [x] Dark mode support
- [ ] Export functionality (placeholder)
- [ ] Bulk operations (planned)
- [ ] Real-time WebSocket updates (planned)

---

**Last Updated**: January 2025
**Version**: 1.0
