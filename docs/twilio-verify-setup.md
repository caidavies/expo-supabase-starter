# Twilio Verify Authentication Setup

This document explains how to set up Twilio Verify for phone-based authentication in your Expo Supabase Starter app.

## Overview

The app now uses phone verification instead of traditional email/password authentication. The flow is:

1. User enters phone number
2. Twilio sends verification code via SMS
3. User enters the 6-digit code
4. If user is new → redirect to onboarding
5. If user exists → sign them in directly

## Files Created/Modified

### New Files:
- `app/(public)/phone-verify.tsx` - Phone verification screen
- `app/(onboarding)/` - Onboarding screens for new users
- `api/verify/send.ts` - Backend API for sending verification codes
- `api/verify/check.ts` - Backend API for checking verification codes

### Modified Files:
- `context/supabase-provider.tsx` - Added phone verification methods
- `app/(public)/welcome.tsx` - Updated to use phone verification
- `docs/twilio-verify-setup.md` - This documentation

## Backend Implementation

You'll need to implement the backend API endpoints. Here's what you need:

### 1. Install Twilio SDK
```bash
npm install twilio
```

### 2. Environment Variables
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
```

### 3. Backend API Endpoints

#### Send Verification Code
```javascript
// POST /api/verify/send
app.post('/api/verify/send', async (req, res) => {
  try {
    const { phone } = req.body;
    
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: 'sms'
      });
    
    res.json({ 
      success: true, 
      verificationId: verification.sid 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});
```

#### Check Verification Code
```javascript
// POST /api/verify/check
app.post('/api/verify/check', async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phone,
        code: code
      });
    
    if (verificationCheck.status === 'approved') {
      // Check if user exists in your database
      const existingUser = await db.users.findByPhone(phone);
      const isNewUser = !existingUser;
      
      res.json({ 
        status: 'approved',
        isNewUser,
        user: existingUser || null
      });
    } else {
      res.json({ 
        status: 'denied',
        isNewUser: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify code' });
  }
});
```

## Frontend Implementation

The frontend is already set up with:

1. **Phone Verification Screen** (`phone-verify.tsx`)
   - Phone number input
   - OTP input
   - Navigation to onboarding for new users

2. **Onboarding Screen** (`onboarding.tsx`)
   - Name and email collection
   - Profile completion for new users

3. **Updated Auth Context**
   - `verifyPhone()` - Sends verification code
   - `verifyOTP()` - Verifies the code
   - `completeOnboarding()` - Completes user profile

## Next Steps

1. **Set up Twilio Account**
   - Create a Twilio account
   - Set up a Verify service
   - Get your credentials

2. **Implement Backend**
   - Create the API endpoints shown above
   - Set up your database to store user profiles
   - Handle user creation and authentication

3. **Update API URLs**
   - Update the fetch URLs in `api/verify/send.ts` and `api/verify/check.ts`
   - Point to your actual backend endpoints

4. **Test the Flow**
   - Test with real phone numbers
   - Verify the onboarding flow works
   - Test existing user sign-in

## Security Considerations

- Store phone numbers securely
- Implement rate limiting for verification attempts
- Use HTTPS for all API calls
- Validate phone numbers on both frontend and backend
- Consider implementing phone number blacklisting for abuse prevention

## Troubleshooting

- **Verification codes not sending**: Check Twilio credentials and service setup
- **Invalid phone numbers**: Implement proper phone number validation
- **Navigation issues**: Ensure proper routing setup in your app
- **Backend errors**: Check server logs and Twilio console for errors 