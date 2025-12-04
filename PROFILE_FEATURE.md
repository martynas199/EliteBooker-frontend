# 👤 Admin Profile Management

## Overview

A comprehensive profile management page where logged-in admins can:

- View their account information
- Update their name and email
- Change their password
- View account details (ID, role, status, last login)

---

## Features

### 1. Profile Overview Card

- **Large Avatar** with initials
- **Admin Name** display
- **Email Address** display
- **Role Badge** (admin/super_admin)
- **Status Badge** (Active/Inactive)

### 2. Profile Information Form

- **Edit Name** - Update full name
- **Edit Email** - Change email address
- **Validation**:
  - Name required
  - Valid email format
  - Email uniqueness check
- **Actions**:
  - Save Changes button
  - Reset button (revert to current values)

### 3. Change Password Form

- **Current Password** - Verify identity
- **New Password** - Minimum 8 characters
- **Confirm Password** - Must match new password
- **Validation**:
  - Current password correct
  - New password ≥ 8 characters
  - Passwords match
  - New password different from current
- **Actions**:
  - Change Password button
  - Clear button (clear all fields)
- **Password Requirements Info Box**

### 4. Account Information Card

- **Account ID** (MongoDB ObjectId)
- **Role** (admin/super_admin)
- **Account Status** (Active/Inactive)
- **Last Login** timestamp

---

## API Endpoints

### PATCH /api/auth/me

Update admin profile (name, email)

**Request Headers**:

```
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "name": "John Smith",
  "email": "john@example.com"
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "admin": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "super_admin",
    "active": true,
    "lastLogin": "2025-10-26T10:30:00.000Z"
  }
}
```

**Response (Error - Email in Use)**:

```json
{
  "error": "Email is already in use by another admin"
}
```

### PATCH /api/auth/change-password

Change admin password

**Request Headers**:

```
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Response (Success)**:

```json
{
  "success": true,
  "token": "new-jwt-token...",
  "admin": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "super_admin",
    "active": true,
    "lastLogin": "2025-10-26T10:30:00.000Z"
  }
}
```

**Response (Error - Wrong Password)**:

```json
{
  "error": "Current password is incorrect"
}
```

---

## Files Created/Modified

### Frontend (3 files)

1. **`src/admin/pages/Profile.jsx`** (NEW - 520+ lines)

   - Complete profile management UI
   - Two forms: Profile Info & Change Password
   - Success/error messages
   - Real-time validation
   - Loading states
   - Auto-clear success messages (3 seconds)

2. **`src/app/routes.jsx`** (MODIFIED)

   - Added Profile import (lazy loaded)
   - Added `/admin/profile` route
   - Wrapped in Suspense with loading spinner

3. **`src/admin/AdminLayout.jsx`** (MODIFIED)
   - Added "Profile" link to sidebar navigation
   - Icon: 👤
   - Positioned before Settings

### Backend (1 file)

4. **`src/routes/auth.js`** (MODIFIED)
   - Added `PATCH /api/auth/me` endpoint
   - Updates name and email
   - Email uniqueness validation
   - Updated response objects to include `_id`, `active`, `lastLogin`

---

## User Flow

### Update Profile Flow

1. Navigate to `/admin/profile`
2. See current name and email pre-filled
3. Edit name or email
4. Click "Save Changes"
5. See green success message
6. Redux store updates automatically
7. Sidebar shows new name immediately
8. Success message auto-clears after 3 seconds

### Change Password Flow

1. Navigate to `/admin/profile`
2. Scroll to "Change Password" section
3. Enter current password
4. Enter new password (min 8 chars)
5. Confirm new password
6. Click "Change Password"
7. Backend verifies current password
8. New password saved (hashed with bcrypt)
9. New JWT token issued automatically
10. See green success message
11. Form clears automatically
12. Continue using app with new token

---

## Validation Rules

### Name Validation

- ✅ Required field
- ✅ Cannot be empty or whitespace only
- ✅ Trimmed before saving

### Email Validation

- ✅ Required field
- ✅ Must be valid email format
- ✅ Must be unique (not used by another admin)
- ✅ Case-insensitive
- ✅ Trimmed and lowercased before saving

### Password Validation

- ✅ Current password must be correct
- ✅ New password minimum 8 characters
- ✅ New password must match confirmation
- ✅ New password must be different from current
- ✅ Frontend validation before API call

---

## Security Features

### Authentication Required

- All endpoints require valid JWT token
- Token from Authorization header or cookie
- Expired tokens rejected

### Password Security

- Current password verified before change
- New password hashed with bcrypt (12 rounds)
- New JWT issued after password change
- Old tokens invalidated (passwordChangedAt updated)

### Email Uniqueness

- Checks for existing admin with same email
- Case-insensitive comparison
- Prevents duplicate accounts

### Input Sanitization

- Email trimmed and lowercased
- Name trimmed
- HTML/script injection prevented

---

## UI Components Used

### Cards

- `<Card>` from `components/ui/Card`
- White background, rounded corners, shadow

### Buttons

- `<Button>` from `components/ui/Button`
- Variants: brand (primary), secondary
- Loading states with spinner

### Form Fields

- `<FormField>` from `components/forms/FormField`
- Labels, required indicators
- Consistent styling

### Icons

- Heroicons via inline SVG
- User icon (profile)
- Lock icon (password)
- Info icon (account details)
- Check icon (success)
- X icon (error)

### Success/Error Messages

- Green background for success
- Red background for errors
- Icon + text
- Auto-dismiss after 3 seconds

---

## Redux Integration

### State Updates

**After Profile Update**:

```javascript
dispatch(
  updateAdmin({
    name: "New Name",
    email: "new@email.com",
  })
);
```

This updates:

- Redux store: `state.auth.admin`
- LocalStorage: `admin` key
- UI automatically re-renders with new data

**After Password Change**:

- New JWT token issued
- Token stored in localStorage
- Old token invalidated
- User stays logged in (seamless)

---

## Error Handling

### Profile Update Errors

| Error         | Message                       | Handling           |
| ------------- | ----------------------------- | ------------------ |
| Name empty    | "Name is required"            | Show red error box |
| Invalid email | "Valid email is required"     | Show red error box |
| Email taken   | "Email is already in use..."  | Show red error box |
| Network error | "Failed to update profile..." | Show red error box |

### Password Change Errors

| Error                 | Message                                      | Handling            |
| --------------------- | -------------------------------------------- | ------------------- |
| Wrong password        | "Current password is incorrect"              | Show red error box  |
| Password too short    | "New password must be at least 8 characters" | Frontend validation |
| Passwords don't match | "New passwords do not match"                 | Frontend validation |
| Same password         | "New password must be different..."          | Frontend validation |
| Network error         | "Failed to change password..."               | Show red error box  |

---

## Testing

### Test 1: Update Name

```bash
# Login first
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.token'

# Update name (use token from above)
curl -X PATCH http://localhost:4000/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"New Name","email":"admin@example.com"}'
```

**Expected**: Success response with updated name

### Test 2: Update Email

```bash
curl -X PATCH http://localhost:4000/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Admin User","email":"newemail@example.com"}'
```

**Expected**: Success response with updated email

### Test 3: Duplicate Email

```bash
# Try to use email of another admin
curl -X PATCH http://localhost:4000/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Admin","email":"another-admin@example.com"}'
```

**Expected**: 409 error "Email is already in use..."

### Test 4: Change Password

```bash
curl -X PATCH http://localhost:4000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"currentPassword":"password123","newPassword":"newpassword456"}'
```

**Expected**: Success with new JWT token

### Test 5: Wrong Current Password

```bash
curl -X PATCH http://localhost:4000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"currentPassword":"wrongpassword","newPassword":"newpassword456"}'
```

**Expected**: 401 error "Current password is incorrect"

---

## UI Screenshots Description

### Profile Overview Card

```
┌───────────────────────────────────────────────┐
│  [JS]  John Smith                            │
│        john@example.com                      │
│        [super_admin] [● Active]              │
└───────────────────────────────────────────────┘
```

### Profile Information Form

```
┌───────────────────────────────────────────────┐
│  👤 Profile Information                      │
│                                              │
│  Full Name *                                 │
│  [John Smith                           ]     │
│                                              │
│  Email Address *                             │
│  [john@example.com                     ]     │
│                                              │
│  [Save Changes]  [Reset]                     │
└───────────────────────────────────────────────┘
```

### Change Password Form

```
┌───────────────────────────────────────────────┐
│  🔒 Change Password                          │
│                                              │
│  ℹ Password Requirements:                    │
│  • At least 8 characters long               │
│  • Different from your current password     │
│  • Mix of letters, numbers, and symbols     │
│                                              │
│  Current Password *                          │
│  [••••••••                             ]     │
│                                              │
│  New Password *                              │
│  [••••••••                             ]     │
│  Minimum 8 characters                        │
│                                              │
│  Confirm New Password *                      │
│  [••••••••                             ]     │
│                                              │
│  [Change Password]  [Clear]                  │
└───────────────────────────────────────────────┘
```

### Account Information Card

```
┌───────────────────────────────────────────────┐
│  ℹ Account Information                       │
│                                              │
│  Account ID                                  │
│  507f1f77bcf86cd799439011                    │
│  ───────────────────────────────────────     │
│  Role                                        │
│  super_admin                                 │
│  ───────────────────────────────────────     │
│  Account Status                              │
│  Active                                      │
│  ───────────────────────────────────────     │
│  Last Login                                  │
│  10/26/2025, 10:30:00 AM                     │
└───────────────────────────────────────────────┘
```

---

## Accessibility

- ✅ All form fields have proper labels
- ✅ Required fields marked with asterisk
- ✅ Error messages clearly visible
- ✅ Success messages with icons
- ✅ Keyboard navigation supported
- ✅ Focus states on inputs
- ✅ Disabled state during loading
- ✅ Semantic HTML structure

---

## Responsive Design

- ✅ Mobile-friendly layout
- ✅ Cards stack on mobile
- ✅ Full-width inputs on mobile
- ✅ Touch-friendly button sizes
- ✅ Readable font sizes
- ✅ Proper spacing and padding

---

## Next Steps (Optional Enhancements)

- [ ] Upload profile photo
- [ ] Email verification on email change
- [ ] Password strength meter
- [ ] Two-factor authentication setup
- [ ] Activity log (login history, changes)
- [ ] Export account data
- [ ] Delete account option (with confirmation)
- [ ] Session management (view/revoke active sessions)

---

## Summary

✅ **Complete profile management system**  
✅ **Update name and email**  
✅ **Change password securely**  
✅ **View account information**  
✅ **Real-time validation**  
✅ **Success/error feedback**  
✅ **Redux integration**  
✅ **Responsive design**  
✅ **Accessible UI**  
✅ **Production-ready**

**All features tested and working!** 🚀
