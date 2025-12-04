# Admin-Beautician Link Management UI

## Overview

A new admin dashboard page that provides a user-friendly interface for linking admin accounts to beautician profiles. This eliminates the need to run command-line scripts for managing these relationships.

## Purpose

The Admin-Beautician link allows administrators to manage Stripe Connect settings for specific beauticians. When an admin is linked to a beautician:

- The admin can access and manage the beautician's Stripe Connect account
- The admin can view earnings reports for that beautician
- The admin must log out and log back in to see changes take effect

## Features

### 1. Visual Link Creation

- **Searchable Admin List**: Filter admins by name or email
- **Searchable Beautician List**: Filter beauticians by name or email
- **Visual Selection**: Click to select from scrollable lists
- **Link Status**: Shows if an admin is already linked to another beautician
- **Confirmation**: Displays preview of the link before creating

### 2. Current Links Management

- **Table View**: Shows all existing admin-beautician relationships
- **Detailed Information**: Displays names, emails, and status
- **Unlink Action**: One-click removal of relationships with confirmation
- **Empty State**: Friendly message when no links exist

### 3. User Experience

- **Search Functionality**: Quick filtering for both admins and beauticians
- **Real-time Updates**: Automatically refreshes after creating/removing links
- **Error Handling**: Clear error messages with toast notifications
- **Loading States**: Shows spinners during API operations
- **Responsive Design**: Works on mobile, tablet, and desktop

## API Endpoints

### Backend Routes (Added)

#### `GET /api/admin/admins`

- **Description**: Fetches all admin accounts
- **Authentication**: Required (JWT token)
- **Response**: Array of admin objects (without passwords)

#### `PATCH /api/admin/admins/:adminId/link-beautician`

- **Description**: Links or unlinks an admin to a beautician
- **Authentication**: Required (JWT token)
- **Body**:
  ```json
  {
    "beauticianId": "beautician_id_here" // or null to unlink
  }
  ```
- **Response**:
  ```json
  {
    "message": "Admin successfully linked to beautician",
    "admin": {
      /* updated admin object */
    }
  }
  ```

#### `GET /api/admin/admins/:adminId`

- **Description**: Fetches a specific admin by ID
- **Authentication**: Required (JWT token)
- **Response**: Admin object (without password)

## File Structure

### Frontend Files

```
beauty-salon-frontend/
  src/
    admin/
      pages/
        AdminBeauticianLink.jsx   # Main component (NEW)
      AdminLayout.jsx              # Updated navigation
    app/
      routes.jsx                   # Added route
```

### Backend Files

```
beauty-salon-backend/
  src/
    routes/
      admins.js                    # New admin management routes (NEW)
    server.js                      # Registered new routes
```

## Usage

### Accessing the Page

1. Log in to the admin dashboard
2. Navigate to "Admin-Beautician Links" in the sidebar (🔗 icon)
3. The page displays in the main content area

### Creating a Link

1. In the "Create New Link" section:
   - Search for and select an admin from the left column
   - Search for and select a beautician from the right column
2. Review the preview showing: "Admin Name → Beautician Name"
3. Click "Link Admin to Beautician" button
4. Success toast appears confirming the link
5. The link appears in the "Current Links" table below

### Removing a Link

1. Find the link in the "Current Links" table
2. Click the red "Unlink" button in the Actions column
3. Confirm the action in the browser prompt
4. Success toast appears confirming removal
5. The link disappears from the table

### Important Notes

- **Re-login Required**: After linking/unlinking, the admin must log out and log back in to see Stripe Connect settings
- **Single Link**: Each admin can only be linked to one beautician at a time
- **Overwriting**: Linking an already-linked admin to a new beautician will overwrite the previous link
- **Beautician Email**: Some beauticians may not have email addresses (shows "No email")

## UI Components Used

- **Card**: Container for sections
- **Input**: Search fields for filtering
- **Button**: Actions (Link, Unlink)
- **Toast**: Success/error notifications (react-hot-toast)

## Styling

- **Brand Colors**: Uses brand-600/700 for primary actions
- **Typography**: Playfair Display (serif) for headings
- **Responsive**: Grid layout on desktop, stack on mobile
- **Interactive States**: Hover effects, selection highlighting
- **Icons**: SVG icons for visual clarity

## Security

- All routes require admin JWT authentication
- Passwords are never exposed in API responses
- CORS protection enabled
- Rate limiting applies to all admin routes

## Error Handling

### Frontend Errors

- Network errors: "Failed to load admins and beauticians"
- Link errors: Shows specific error from backend
- Validation: "Please select both an admin and a beautician"

### Backend Errors

- 404: Admin or beautician not found
- 500: Database or server errors
- 401: Unauthorized (invalid/missing token)

## Testing Checklist

- [ ] Can access page from admin navigation
- [ ] Search filters work for both admins and beauticians
- [ ] Can select admin and beautician visually
- [ ] Link button is disabled until both are selected
- [ ] Creating link shows success toast
- [ ] New link appears in Current Links table immediately
- [ ] Can unlink existing relationships
- [ ] Confirmation prompt appears before unlinking
- [ ] Empty state displays when no links exist
- [ ] Info card explains the feature clearly
- [ ] Mobile responsive layout works correctly
- [ ] Loading spinner shows during API calls
- [ ] Admin must re-login to see Stripe Connect changes

## Comparison with Command-Line Script

### Old Method (scripts/linkAdminToBeautician.js)

```bash
node scripts/linkAdminToBeautician.js admin@salon.com beautician@salon.com
```

- Requires server access
- Must know exact email addresses
- No visual confirmation
- Prone to typos

### New Method (Admin Dashboard UI)

- No server access needed
- Visual search and selection
- Live preview before linking
- View all existing links
- One-click unlinking
- Mobile-friendly

## Future Enhancements

Possible improvements:

- Bulk link operations
- Link history/audit log
- Email notifications when linked/unlinked
- Permissions management (who can create links)
- Export links as CSV
- Filter/sort current links table
- Show beautician earnings in the table

## Related Documentation

- See `scripts/linkAdminToBeautician.js` for the original CLI implementation
- See `STRIPE_CONNECT_COMPLETE.md` for Stripe Connect setup
- See `OAUTH_SETUP.md` for admin authentication setup
