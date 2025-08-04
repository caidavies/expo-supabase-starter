# Supabase Phone Verification Setup Guide

This guide will help you set up phone verification using Supabase's built-in Twilio integration.

## Prerequisites

1. A Supabase project
2. Twilio account (for SMS verification)

## Step 1: Configure Supabase Auth Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Phone Auth**, enable:
   - **Enable phone confirmations**
   - **Enable phone number changes**

## Step 2: Set up Twilio Integration

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Scroll down to **SMS Provider**
3. Select **Twilio** as your SMS provider
4. Enter your Twilio credentials:
   - **Account SID**: Your Twilio Account SID
   - **Auth Token**: Your Twilio Auth Token
   - **Message Service ID**: Your Twilio Messaging Service SID (optional)

## Step 3: Set up Database Schema

Run the SQL commands from `supabase-setup.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Execute the script

This will create:
- `profiles` table for user profiles
- Row Level Security (RLS) policies
- Automatic profile creation trigger

## Step 4: Configure Environment Variables

Make sure your Supabase configuration is set up in your app:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 5: Test the Integration

1. Start your development server
2. Navigate to the signup flow
3. Complete the signup process
4. Enter a phone number for verification
5. Check your phone for the verification code
6. Enter the code to complete verification

## Flow Overview

The complete user flow is now:

1. **Sign Up** → User enters email and password
2. **Phone Verification** → User enters phone number and receives SMS
3. **OTP Verification** → User enters the 6-digit code
4. **Onboarding** → User completes profile setup
5. **Homepage** → User is redirected to the main app

## Troubleshooting

### Common Issues

1. **"Failed to send verification code"**
   - Check your Twilio credentials in Supabase settings
   - Ensure your Twilio account has sufficient credits
   - Verify the phone number format (should include country code)

2. **"Failed to verify code"**
   - Check if the code is correct
   - Ensure the code hasn't expired (usually 10 minutes)
   - Verify the phone number matches

3. **Database errors**
   - Ensure the Supabase tables are created correctly
   - Check your RLS policies are set up properly

### Testing with Test Numbers

For development, you can use Twilio's test phone numbers:
- **US**: `+15005550006` (always returns code `123456`)
- **Other countries**: Check [Twilio test numbers](https://www.twilio.com/docs/verify/test-numbers)

**Note**: Test accounts can only send SMS to verified test numbers. For production, upgrade to a paid Twilio account.

## Security Considerations

1. **Rate Limiting**: Supabase handles rate limiting automatically
2. **Phone Number Validation**: Supabase validates phone numbers
3. **Session Management**: Supabase handles sessions automatically
4. **Error Handling**: Supabase provides secure error messages

## Production Deployment

Before deploying to production:

1. **Environment Variables**: Ensure all environment variables are set
2. **Database Migration**: Run the SQL setup script in your production database
3. **Twilio Settings**: Configure your Twilio service for production use
4. **Monitoring**: Set up monitoring for verification success/failure rates

## Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Twilio**: Check [Twilio Support](https://support.twilio.com/)
- **This App**: Check the project documentation or create an issue 