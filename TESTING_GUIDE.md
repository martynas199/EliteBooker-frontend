# 🧪 Testing Guide: Stripe Connect Onboarding Callbacks

## Quick Start Testing Guide

### Prerequisites

✅ Backend running on `http://localhost:4000`  
✅ Frontend running on `http://localhost:5173`  
✅ Stripe test account credentials configured in backend `.env`

---

## 🎯 Testing Steps

### **Test 1: View the Onboarding Complete Page (Direct Access)**

This tests the page without going through Stripe onboarding.

1. **Open your browser** and navigate to:

   ```
   http://localhost:5173/admin/settings/onboarding-complete
   ```

2. **Expected Behavior**:

   - You should see a loading spinner initially
   - Then one of these states:
     - ❌ **Error state**: "Beautician ID not found" (if not logged in as admin)
     - 🟡 **Incomplete/Not Connected**: If no Stripe account exists
     - 🟢 **Success**: If Stripe account is already connected

3. **What to Check**:
   - ✅ Page loads without crashes
   - ✅ Icons display correctly
   - ✅ Buttons are clickable
   - ✅ "Go to Settings" button navigates to `/admin/settings`

---

### **Test 2: View the Reauth Page (Direct Access)**

1. **Navigate to**:

   ```
   http://localhost:5173/admin/settings/reauth
   ```

2. **Expected Behavior**:

   - Orange refresh icon displays
   - "Continue Stripe Setup" header
   - Info box explaining why you're here
   - Two buttons: "Continue Onboarding" and "Cancel & Go Back"

3. **Test Actions**:
   - ✅ Click **"Cancel & Go Back"** → Should go to `/admin/settings`
   - ✅ Click **"Continue Onboarding"** → Should show loading spinner
     - If logged in: Creates new Stripe link and redirects
     - If not logged in: Shows error message

---

### **Test 3: Complete Stripe Connect Flow (Full Integration)**

This is the full end-to-end test.

#### **Step 1: Log in to Admin Panel**

```
http://localhost:5173/admin/login
```

- Use your admin credentials
- Navigate to Settings page

#### **Step 2: Go to Settings**

```
http://localhost:5173/admin/settings
```

- Scroll down to find **"Stripe Connect Settings"** section
- You should see a status badge (likely "Not Connected")

#### **Step 3: Start Onboarding**

1. Click the **"Connect with Stripe"** button
2. **Expected**:
   - Button shows loading state
   - After a moment, you're redirected to Stripe's website
   - URL will be something like: `https://connect.stripe.com/express/oauth/...`

#### **Step 4: Complete Stripe Onboarding (Test Mode)**

On Stripe's site:

**Option A - Use Stripe Test Data** (Recommended):

1. When asked for phone number, use: `000 000 0000`
2. When asked for verification code, use: `000000`
3. For bank account, Stripe will auto-fill test data
4. For business details, use any test information

**Option B - Skip for Testing**:

- Stripe test mode allows you to skip most steps
- Just click through the pages

#### **Step 5: Return to Your App**

After completing onboarding:

1. Stripe will redirect you to: `http://localhost:5173/admin/settings/onboarding-complete`
2. **Expected Results**:

   - 🟢 Green success icon
   - "🎉 Stripe Account Connected!" message
   - Account details showing:
     - ✅ Charges Enabled: Yes
     - ✅ Payouts Enabled: Yes
     - Account ID: `acct_...`
   - "What's Next?" section with payment info
   - "Go to Settings" button

3. Click **"Go to Settings"**
4. **Expected**:
   - Settings page loads
   - Stripe Connect section now shows **"Connected"** status (green badge)
   - New buttons available: "View Earnings", "Stripe Dashboard"

---

### **Test 4: Test the Reauth Flow**

To test the refresh/reauth functionality:

#### **Method 1: Simulate Expired Link**

1. Go to Settings: `http://localhost:5173/admin/settings`
2. Manually navigate to: `http://localhost:5173/admin/settings/reauth`
3. Click **"Continue Onboarding"**
4. **Expected**:
   - New onboarding link created
   - Redirected to Stripe (may show "already connected" message if you just completed onboarding)

#### **Method 2: Test During Incomplete Onboarding**

1. Start fresh (disconnect your account first if connected)
2. Click "Connect with Stripe"
3. On Stripe's site, **close the browser tab before finishing**
4. Stripe should redirect you to the reauth page
5. Click "Continue Onboarding" to resume where you left off

---

### **Test 5: Check Additional Features**

Once connected, test the earnings features:

1. **View Earnings Modal**:

   - Go to Settings: `http://localhost:5173/admin/settings`
   - Click **"View Earnings"** button
   - **Expected**: Modal opens showing:
     - Total Earnings: £0.00 (if no transactions yet)
     - Bookings Revenue: £0.00
     - Products Revenue: £0.00
     - Platform Fees: £0.00
     - Recent Bookings table (empty if none)

2. **Access Stripe Dashboard**:

   - Click **"Stripe Dashboard"** button
   - **Expected**: Opens Stripe Express dashboard in new tab
   - You can view your Stripe account details there

3. **Disconnect Account** (Optional):
   - Click **"Disconnect Account"** button
   - **Expected**:
     - Confirmation prompt
     - Status changes back to "Not Connected"
     - Can re-connect again

---

### **Test 6: Test Revenue Dashboard**

1. **Navigate to Revenue Page**:

   ```
   http://localhost:5173/admin/revenue
   ```

2. **Expected Display**:
   - If you have any completed bookings with Stripe Connect:
     - **Platform Revenue (Stripe Connect)** card appears at top
     - Shows 5 metrics:
       - Platform Fees
       - Beautician Earnings
       - Bookings
       - Products
       - Total Revenue
   - Regular revenue cards below
   - Date range filters work

---

## 🐛 Common Issues & Solutions

### Issue 1: "Beautician ID not found"

**Cause**: You're not logged in as an admin with a beautician account  
**Solution**:

- Log in to admin panel first
- Ensure your admin account has a `beauticianId` field in the database

### Issue 2: "Failed to create onboarding link"

**Cause**: Backend Stripe credentials not configured  
**Solution**:

- Check backend `.env` file has `STRIPE_SECRET_KEY`
- Restart backend server after adding env vars

### Issue 3: Redirect doesn't work

**Cause**: `FRONTEND_URL` not set in backend  
**Solution**:

- Add to backend `.env`: `FRONTEND_URL=http://localhost:5173`
- Restart backend server

### Issue 4: Page shows "Not Connected" after onboarding

**Cause**: Webhook not fired or status not checked  
**Solution**:

- Click "Refresh Status" button in Settings
- Or manually navigate to onboarding-complete page to trigger status check

### Issue 5: "Network Error" when clicking buttons

**Cause**: Backend not running or wrong URL  
**Solution**:

- Check backend is running on port 4000
- Verify `VITE_API_URL=http://localhost:4000` in frontend `.env`

---

## 📱 Mobile Testing

To test on mobile viewport:

1. **Open Chrome DevTools** (F12)
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. Navigate through the same tests
5. **Check**:
   - ✅ Responsive layouts work
   - ✅ Buttons are tappable
   - ✅ Text is readable
   - ✅ Modals display correctly

---

## 🎨 Visual Checklist

### OnboardingComplete Page

- [ ] Loading spinner appears initially
- [ ] Success: Green circle with checkmark icon
- [ ] Success: Account details card (gray background)
- [ ] Success: "What's Next?" blue info box
- [ ] Success: "Go to Settings" button (purple/brand color)
- [ ] Incomplete: Yellow circle with warning icon
- [ ] Incomplete: Requirements list in yellow box
- [ ] Error: Red circle with X icon
- [ ] Error: Error message in red box
- [ ] Error: "Try Again" and "Return to Settings" buttons

### ReauthOnboarding Page

- [ ] Orange circle with refresh icon
- [ ] "Continue Stripe Setup" heading
- [ ] Blue info box with 3 bullet points
- [ ] "Continue Onboarding" button (purple/brand color)
- [ ] "Cancel & Go Back" button (gray)
- [ ] Help text at bottom with support email link

---

## 🔍 Browser Console Testing

1. **Open Chrome DevTools** (F12)
2. Go to **Console** tab
3. Navigate through the onboarding flow
4. **Watch for**:
   - ✅ No red errors
   - ✅ API calls succeed (check Network tab)
   - ✅ Status updates logged

**Expected Console Logs**:

```javascript
// When checking status
"Fetching account status for beautician: 123456...";
"Account status received: { connected: true, ... }";

// When creating onboarding link
"Creating onboarding link...";
"Onboarding URL received: https://connect.stripe.com/...";
```

---

## 📊 Test Results Template

Use this checklist to track your testing:

```
[ ] Test 1: Direct access to /onboarding-complete
[ ] Test 2: Direct access to /reauth
[ ] Test 3: Full Stripe Connect flow
    [ ] Login
    [ ] Click Connect button
    [ ] Redirect to Stripe
    [ ] Complete onboarding
    [ ] Return to success page
    [ ] Navigate back to Settings
    [ ] Verify "Connected" status
[ ] Test 4: Reauth flow
[ ] Test 5: View Earnings modal
[ ] Test 6: Stripe Dashboard button
[ ] Test 7: Revenue dashboard shows Connect data
[ ] Test 8: Mobile responsive design
[ ] Test 9: Browser console (no errors)
[ ] Test 10: Disconnect & reconnect
```

---

## 🚀 Quick Test Sequence (5 minutes)

**Fastest way to verify everything works**:

1. ✅ Open `http://localhost:5173/admin/login` → Log in
2. ✅ Go to `http://localhost:5173/admin/settings`
3. ✅ Click "Connect with Stripe" → Redirects to Stripe
4. ✅ Use test data: Phone `000 000 0000`, Code `000000`
5. ✅ Complete onboarding → Returns to success page
6. ✅ Click "Go to Settings" → Shows "Connected" status
7. ✅ Click "View Earnings" → Modal opens
8. ✅ Go to `http://localhost:5173/admin/revenue` → Shows Platform Revenue card

**Done!** ✅

---

## 📞 Need Help?

If something doesn't work:

1. Check browser console for errors (F12)
2. Check backend terminal for API errors
3. Verify environment variables are set
4. Try restarting both servers
5. Check `ONBOARDING_CALLBACKS.md` for detailed docs

---

**Happy Testing!** 🎉
