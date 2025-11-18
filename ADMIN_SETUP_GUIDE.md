# Admin System Setup Guide

## Overview

The admin system provides a secure interface for managing reseller payouts, with role-based access control through the `is_admin` column in the users table.

## Features

- **Payout Management Dashboard**: View, approve, reject, and mark payouts as paid
- **Real-time Statistics**: Track total users, bots, resellers, earnings, and pending payouts
- **Search & Filter**: Find specific payout requests by email, name, or transaction ID
- **Comprehensive Actions**: Approve, reject, or mark payouts as paid with notes and transaction IDs
- **Secure Access**: Row Level Security (RLS) ensures only admins can access sensitive data

## Database Migration

The admin system requires the following migration to be applied:

```bash
# Ensure you're in the project directory
cd pocket-ai-pros

# Push the migration to your database
supabase db push
```

This migration (`20251116000001_admin_system.sql`) adds:
- `is_admin` column to the users table
- `is_user_admin()` helper function
- Updated RLS policies to allow admin access
- `admin_payout_dashboard` view with aggregated data

## Creating Your First Admin User

After deploying the migration, you need to manually grant admin privileges to at least one user.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **users** table
3. Find your user account (search by email)
4. Edit the row and set `is_admin` to `true`
5. Save the changes

### Option 2: Using SQL Query

Run this SQL query in the Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

### Option 3: Using Supabase CLI (Advanced)

```bash
# Connect to your database
supabase db shell

# Run the SQL command
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';

# Exit
\q
```

## Accessing the Admin Dashboard

Once you have admin privileges:

1. Sign in to your account at `/auth`
2. Navigate to `/admin` in your browser
3. You should see the Admin Dashboard with:
   - Platform statistics (users, bots, resellers, earnings)
   - Payout management interface
   - Search and filter capabilities

If you see "Access Denied", verify that:
- You're logged in with the correct account
- The `is_admin` flag is set to `true` for your user
- The database migration has been applied successfully

## Admin Workflow

### Reviewing Payout Requests

1. **Pending Requests**: View all pending payout requests in the dashboard
2. **Reseller Details**: See reseller name, email, client count, and commission rate
3. **Payout Information**: Review amount, method (PayPal, Stripe, Wire, Check), and requested date

### Approving a Payout

1. Click **"Approve"** on a pending payout request
2. (Optional) Add notes explaining the approval
3. Click **"Confirm"** to approve
4. The payout status changes to "approved"
5. Reseller receives notification (if email system is configured)

### Rejecting a Payout

1. Click **"Reject"** on a pending payout request
2. **Required**: Add notes explaining the rejection reason
3. Click **"Confirm"** to reject
4. The payout status changes to "rejected"
5. Funds are returned to reseller's available balance
6. Reseller can see rejection notes in their dashboard

### Marking Payout as Paid

1. After approving, process the actual payment via your payment method
2. Click **"Mark Paid"** on the approved payout
3. **Required**: Enter the transaction/reference ID from your payment processor
4. (Optional) Add payment notes
5. Click **"Confirm"** to mark as paid
6. The payout status changes to "paid"
7. Transaction ID is visible to the reseller

## Search and Filter Features

### Search
- Search by reseller email
- Search by reseller name
- Search by transaction ID

### Filter by Status
- **All**: Show all payout requests
- **Pending**: Only pending approvals (needs action)
- **Approved**: Approved but not yet paid (needs payment processing)
- **Paid**: Completed payouts
- **Rejected**: Rejected requests
- **Cancelled**: Cancelled by reseller

## Security Features

### Row Level Security (RLS)
- All admin queries use RLS policies
- Non-admin users cannot access admin data
- Policies are enforced at the database level

### Admin Check Function
```sql
is_user_admin() -- Returns true only for admin users
```

This function is used in all RLS policies to verify admin access.

### Protected Routes
- `/admin` route automatically redirects non-admins to `/dashboard`
- Access check happens on page load before any data is fetched

## Payout Methods

### PayPal
- Requires reseller's PayPal email
- Use PayPal's mass payout feature
- Transaction ID: PayPal payout batch ID

### Stripe
- Requires reseller's email linked to Stripe account
- Use Stripe Connect or manual bank transfer
- Transaction ID: Stripe transfer ID

### Wire Transfer
- Contact reseller for bank details after approval
- Process through your bank
- Transaction ID: Wire transfer reference number

### Check
- Mail physical check to reseller's address
- Allow 7-10 business days for delivery
- Transaction ID: Check number

## Statistics Dashboard

The admin dashboard displays:

1. **Total Users**: All registered users in the system
2. **Total Bots**: Total number of created chatbots
3. **Resellers**: Number of active resellers
4. **Total Earnings**: Sum of all reseller earnings
5. **Pending Payouts**: Count of requests awaiting approval
6. **Pending Amount**: Total dollar amount pending approval

## Troubleshooting

### "Access Denied" Error
- Verify `is_admin` is set to `true` in the users table
- Check that you're logged in with the admin account
- Ensure the migration has been applied

### Cannot See Payouts
- Verify the migration created the `admin_payout_dashboard` view
- Check RLS policies are correctly configured
- Ensure resellers have actually requested payouts

### Action Buttons Don't Work
- Check browser console for errors
- Verify database functions exist: `approve_payout`, `reject_payout`, `mark_payout_paid`
- Ensure your admin user has proper permissions

## Database Schema

### Users Table (Updated)
```sql
users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,  -- NEW COLUMN
  ...
)
```

### Admin Payout Dashboard View
```sql
admin_payout_dashboard (
  id,
  reseller_id,
  amount,
  status,
  payout_method,
  payout_email,
  requested_at,
  reviewed_at,
  paid_at,
  review_notes,
  transaction_id,
  reseller_email,
  reseller_name,
  reseller_total_earnings,
  reseller_clients_count,
  reseller_commission_rate
)
```

## Best Practices

1. **Review Promptly**: Approve/reject payout requests within 2-3 business days
2. **Document Decisions**: Always add notes when rejecting payouts
3. **Verify Details**: Check reseller legitimacy before approving large payouts
4. **Track Transactions**: Always record transaction IDs when marking as paid
5. **Monitor Patterns**: Watch for suspicious payout patterns or fraud
6. **Secure Access**: Never share admin credentials
7. **Regular Audits**: Periodically review completed payouts for accuracy

## Future Enhancements

Potential features for future development:
- Automatic payout processing via Stripe/PayPal API
- Bulk payout approval
- Payout scheduling (monthly automatic payouts)
- Tax form generation (1099)
- Fraud detection algorithms
- Email notifications for all status changes
- Export payout history to CSV/Excel
- Admin activity audit log

## Support

For issues with the admin system:
1. Check this documentation first
2. Review the database migration file
3. Check Supabase logs for errors
4. Verify RLS policies in Supabase dashboard

---

**Last Updated**: November 16, 2025
**Migration Version**: 20251116000001
**Status**: Production Ready
