# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in the project details:
   - **Project name**: Choose a name (e.g., "calendar-app")
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

## 2. Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. Copy these values

## 3. Configure Your Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```
   REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Save the file

## 4. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Email** provider and ensure it's enabled
3. Configure email settings:
   - **Enable email confirmations** (recommended for production)
   - For development, you can disable confirmations in **Authentication** > **Settings** > **Email Auth**
   - Set "Confirm email" to OFF for easier testing

## 5. Optional: Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Customize the confirmation and password reset emails if desired

## 6. Test Your Setup

1. Make sure you've saved your `.env` file
2. Restart your development server:
   ```bash
   npm start
   ```
3. You should see the login page
4. Try signing up with an email and password
5. Check your email for the confirmation link (if confirmations are enabled)

## 7. Security Notes

- ✅ The `.env` file is already in `.gitignore` - never commit it!
- ✅ The `anon` key is safe to use in client-side code
- ✅ Supabase's Row Level Security (RLS) protects your data
- ⚠️ For production, consider implementing RLS policies

## 8. Next Steps (Optional)

### Store Events in Supabase

To persist calendar events in the database:

1. Create an `events` table in Supabase:
   - Go to **Table Editor** > **Create a new table**
   - Table name: `events`
   - Columns:
     - `id` (uuid, primary key, default: uuid_generate_v4())
     - `user_id` (uuid, references auth.users)
     - `title` (text)
     - `description` (text, nullable)
     - `date` (timestamp)
     - `end_date` (timestamp, nullable)
     - `start_time` (text)
     - `end_time` (text)
     - `created_at` (timestamp, default: now())

2. Enable Row Level Security (RLS):
   ```sql
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   
   -- Users can only see their own events
   CREATE POLICY "Users can view own events"
   ON events FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Users can insert their own events
   CREATE POLICY "Users can insert own events"
   ON events FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   
   -- Users can update their own events
   CREATE POLICY "Users can update own events"
   ON events FOR UPDATE
   USING (auth.uid() = user_id);
   
   -- Users can delete their own events
   CREATE POLICY "Users can delete own events"
   ON events FOR DELETE
   USING (auth.uid() = user_id);
   ```

3. Update `CalendarContext.tsx` to sync events with Supabase

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file exists and has the correct values
- Restart your development server after adding/changing `.env`

### "Invalid API key"
- Double-check you copied the **anon public** key, not the service role key
- Ensure there are no extra spaces in your `.env` file

### Not receiving confirmation emails
- Check your spam folder
- For testing, disable email confirmations in Supabase settings
- Verify email provider is enabled in Authentication > Providers

### "Cannot read properties of undefined (reading 'auth')"
- The Supabase URL or key is missing/incorrect
- Check browser console for the exact error message

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)
- [Supabase Discord Community](https://discord.supabase.com)
