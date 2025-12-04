# OAuth Authentication Implementation Guide

## ✅ Implementation Complete

Your beauty salon platform now supports **Google OAuth** and **Apple Sign In** in addition to traditional email/password authentication.

## 🎯 Features Implemented

### Backend (Node.js + Passport.js)

- ✅ Passport.js with Google OAuth 2.0 Strategy
- ✅ Passport.js with Apple Sign In Strategy
- ✅ Updated User model to support OAuth providers
- ✅ Account linking (existing email users can link OAuth)
- ✅ Automatic user creation on first OAuth login
- ✅ JWT token generation for OAuth users
- ✅ OAuth callback routes with proper redirects
- ✅ Environment variable configuration

### Frontend (React)

- ✅ OAuthButtons component with branded buttons
- ✅ AuthSuccessPage for OAuth callback handling
- ✅ Login page with OAuth options
- ✅ Register page with OAuth options
- ✅ Checkout prompts link to login/register (which have OAuth)
- ✅ Token storage and user refresh on OAuth success

## 📁 Files Created/Modified

### Backend Files Created:

1. **`src/config/passport.js`** - Passport.js configuration with Google & Apple strategies
2. **`src/routes/oauth.js`** - OAuth authentication routes and callbacks
3. **`OAUTH_SETUP.md`** - Detailed setup guide for OAuth providers

### Backend Files Modified:

1. **`src/models/User.js`** - Added `googleId`, `appleId`, `authProvider` fields, made password optional for OAuth
2. **`src/server.js`** - Added Passport initialization and OAuth routes

### Frontend Files Created:

1. **`src/features/auth/OAuthButtons.jsx`** - Reusable OAuth button component
2. **`src/features/auth/AuthSuccessPage.jsx`** - OAuth callback handler
3. **`OAUTH_IMPLEMENTATION.md`** - This documentation

### Frontend Files Modified:

1. **`src/features/auth/LoginPage.jsx`** - Added OAuth buttons
2. **`src/features/auth/RegisterPage.jsx`** - Added OAuth buttons
3. **`src/app/routes.jsx`** - Added `/auth/success` route

## 🔧 Configuration Required

### 1. Environment Variables

Add to your backend `.env` file:

```env
# Backend & Frontend URLs
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# JWT Secret (should already exist)
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth (Optional - only needed if enabling Google login)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple OAuth (Optional - only needed if enabling Apple login)
APPLE_CLIENT_ID=com.yourcompany.webapp
APPLE_TEAM_ID=YOUR10CHARTEAMID
APPLE_KEY_ID=YOUR10CHARKEYID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Navigate to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen
6. Set **Authorized redirect URIs**:
   - Development: `http://localhost:4000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### 3. Apple Sign In Setup

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create an **App ID** with "Sign In with Apple" capability
3. Create a **Services ID**:
   - Identifier: `com.yourcompany.webapp`
   - Enable "Sign In with Apple"
   - Configure:
     - Domain: `yourdomain.com`
     - Return URLs: `https://yourdomain.com/api/auth/apple/callback`
4. Create a **Key**:
   - Enable "Sign In with Apple"
   - Download `.p8` key file
5. Get your **Team ID** from membership details
6. Add all credentials to `.env`

**Note**: Apple requires HTTPS. For local testing, use [ngrok](https://ngrok.com/) to create a secure tunnel:

```bash
ngrok http 4000
```

Then update `BACKEND_URL` and Apple return URLs to the ngrok URL.

## 🚀 How It Works

### User Flow

#### New User (OAuth):

1. User clicks "Sign in with Google" or "Continue with Apple"
2. Redirected to OAuth provider for authentication
3. User approves access
4. OAuth provider redirects to `/api/auth/{provider}/callback`
5. Backend creates new user account (no password required)
6. Backend generates JWT token
7. Redirects to frontend `/auth/success?token={jwt}`
8. Frontend stores token and redirects to profile or checkout

#### Existing User (Account Linking):

1. User has existing email/password account
2. User clicks "Sign in with Google" using same email
3. Backend finds existing user by email
4. Links Google account to existing user
5. User can now sign in with either method

### Technical Flow

```
Frontend (Login Page)
  ↓ User clicks OAuth button
  ↓ window.location = /api/auth/google
Backend (Passport Strategy)
  ↓ Redirects to Google OAuth
Google
  ↓ User authenticates
  ↓ Redirects to /api/auth/google/callback
Backend (Callback Handler)
  ↓ Creates/finds user
  ↓ Generates JWT token
  ↓ Redirects to /auth/success?token={jwt}
Frontend (AuthSuccessPage)
  ↓ Stores token in localStorage
  ↓ Refreshes user data
  ↓ Redirects to profile/checkout
```

## 🔒 Security Features

- ✅ **Account Linking**: Existing users can link OAuth providers to their account
- ✅ **JWT Tokens**: Consistent authentication across all login methods
- ✅ **Unique Constraints**: Google ID and Apple ID are unique in database
- ✅ **Secure Redirects**: Only whitelisted frontend URLs allowed
- ✅ **Token Expiry**: JWT tokens expire after 7 days
- ✅ **HTTPS Required**: Apple OAuth requires HTTPS (production)
- ✅ **Password Optional**: OAuth users don't need passwords

## 📱 User Experience

### Login Page

- Email/password form (traditional)
- "Or continue with" divider
- Google OAuth button (branded colors)
- Apple OAuth button (black, branded)

### Register Page

- Full registration form
- "Or continue with" divider
- Google and Apple buttons
- One-click account creation

### Checkout Pages

- Guest users see prompt: "Sign in or create an account to track your bookings"
- Links to login/register pages (which have OAuth)
- Logged-in users have pre-filled forms

## 🧪 Testing

### Local Testing (Google):

```bash
# Start backend
cd beauty-salon-backend
npm run dev

# Start frontend
cd beauty-salon-frontend
npm run dev

# Test flow:
1. Visit http://localhost:5173/login
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify redirect to profile page
```

### Local Testing (Apple):

```bash
# Install ngrok
npm install -g ngrok

# Create secure tunnel
ngrok http 4000

# Update .env with ngrok URL
BACKEND_URL=https://your-ngrok-url.ngrok.io

# Update Apple return URL in Apple Developer Console
# Test as above
```

### Production Testing:

1. Deploy backend with HTTPS
2. Update OAuth provider callback URLs
3. Set production environment variables
4. Test full authentication flow

## 🐛 Troubleshooting

### "OAuth provider not configured" warning

- Check environment variables are set correctly
- Restart backend server after adding env vars
- Verify no typos in variable names

### Google redirect error

- Verify callback URL matches Google Console exactly
- Check BACKEND_URL environment variable
- Ensure Google+ API is enabled

### Apple "invalid_client" error

- Verify all Apple credentials are correct
- Check APPLE_PRIVATE_KEY format (include \\n for newlines)
- Ensure using HTTPS (ngrok for local)

### User not created

- Check backend logs for Passport strategy errors
- Verify MongoDB connection
- Check User model constraints

### Token not stored

- Check AuthSuccessPage console logs
- Verify frontend can reach backend API
- Check CORS configuration

## 📊 Database Schema

### User Model Updates:

```javascript
{
  email: String (required, unique),
  password: String (required only if !googleId && !appleId),
  googleId: String (optional, unique),
  appleId: String (optional, unique),
  authProvider: "local" | "google" | "apple",
  // ... other fields
}
```

### User Examples:

**Email/Password User**:

```json
{
  "email": "user@example.com",
  "password": "$2a$10$hashed...",
  "authProvider": "local"
}
```

**Google OAuth User**:

```json
{
  "email": "user@gmail.com",
  "googleId": "1234567890",
  "authProvider": "google"
  // No password field
}
```

**Linked Account**:

```json
{
  "email": "user@example.com",
  "password": "$2a$10$hashed...",
  "googleId": "1234567890",
  "authProvider": "google"
  // Can sign in with either method
}
```

## ✨ Next Steps

### Optional Enhancements:

1. **Add More Providers**: Facebook, Twitter, GitHub
2. **Profile Photos**: Pull from OAuth provider profile
3. **Email Verification**: Require verification for email signups (OAuth already verified)
4. **Social Sharing**: Share bookings to social media
5. **Analytics**: Track OAuth vs email signup rates

### Production Checklist:

- [ ] Configure Google OAuth with production domain
- [ ] Configure Apple OAuth with production domain
- [ ] Set up HTTPS for backend
- [ ] Update BACKEND_URL and FRONTEND_URL to production
- [ ] Test full OAuth flow on production
- [ ] Monitor error logs for OAuth issues
- [ ] Update privacy policy to mention OAuth providers

## 📞 Support

If you encounter issues:

1. Check backend logs for Passport errors
2. Verify all environment variables are set
3. Test OAuth provider console configurations
4. Check network tab for redirect errors
5. Review OAUTH_SETUP.md for detailed provider setup

## 🎉 Success Criteria

✅ Users can sign in with Google in one click
✅ Users can sign in with Apple in one click  
✅ Email/password authentication still works
✅ Guest checkout still works
✅ OAuth users can access profile and bookings
✅ Existing users can link OAuth accounts
✅ JWT tokens work across all auth methods

Your OAuth implementation is complete! 🚀
