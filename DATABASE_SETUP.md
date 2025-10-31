# BuildMyBot - Database Setup Instructions

## Supabase Configuration

Your application is configured to use Supabase as the backend database. Follow these steps to complete the setup:

### 1. Database Setup

1. Go to your Supabase project: https://iobjmdcxhinnumxzbmnc.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Create a new query and paste the contents of `supabase-setup.sql`
4. Run the query to create all necessary tables and indexes

### 2. Environment Variables

The following environment variables are already configured in your `.env` file:

```env
VITE_SUPABASE_URL=https://iobjmdcxhinnumxzbmnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Install Dependencies

Run the following command to install the Supabase client:

```bash
npm install @supabase/supabase-js
```

### 4. Database Tables

The setup script creates the following tables:

- **contacts** - Contact form submissions
- **subscribers** - Newsletter subscribers
- **reseller_applications** - Reseller program applications
- **users** - User accounts
- **bots** - AI bots created by users
- **messages** - Messages processed by bots

### 5. Row Level Security (RLS)

The database is configured with Row Level Security policies:

- Public access for form submissions (contacts, subscribers, reseller applications)
- Authenticated users can view their own data
- Admin users can view all data

### 6. API Integration

The application uses direct Supabase client integration:

- No backend server required
- Direct database access from the frontend
- Real-time subscriptions available
- Automatic authentication handling

### 7. Testing the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Try the following features:
   - Submit a contact form
   - Subscribe to the newsletter
   - Apply for the reseller program
   - View bot statistics on the homepage

### 8. Monitoring

Monitor your database in the Supabase dashboard:

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Database**: Monitor performance
- **API Logs**: Track API calls

### 9. Optional: Email Notifications

To enable email notifications:

1. Go to **Authentication > Email Templates** in Supabase
2. Configure your email templates
3. Set up email triggers using Database Webhooks or Edge Functions

### 10. Production Deployment

Before deploying to production:

1. Review RLS policies for security
2. Enable database backups
3. Set up monitoring and alerts
4. Configure rate limiting
5. Review and optimize indexes

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Verify your Supabase URL and anon key in `.env`
2. Check if the tables are created in Supabase Table Editor
3. Review browser console for errors
4. Check Supabase API logs

### Permission Errors

If you get permission errors:

1. Check RLS policies in Supabase Dashboard
2. Verify table permissions
3. Review policy conditions

### Data Not Saving

If data isn't being saved:

1. Check browser console for errors
2. Review Supabase API logs
3. Verify RLS policies allow inserts
4. Check if table structure matches the code

## Support

For help with setup:
- Email: support@buildmybot.ai
- Documentation: https://docs.buildmybot.ai
- Supabase Docs: https://supabase.com/docs
