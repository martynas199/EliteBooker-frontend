# Product Payment Integration with Stripe

## Overview

Complete Stripe Checkout integration for product purchases with support for Stripe Connect (beautician-owned products) and automated payment distribution.

## Features Implemented

### 1. **Stripe Checkout Session** 💳

- Secure payment processing via Stripe Checkout
- Supports multiple payment methods
- Automatic currency conversion (GBP default)
- Promotion codes support
- Shipping address collection

### 2. **Stripe Connect Integration** 🔗

- **Single-beautician orders**: Destination charges (beautician pays Stripe fees)
- **Multi-beautician orders**: Platform receives payment, transfers to beauticians
- **Platform products**: Direct payment to platform account
- Automatic earnings tracking for beauticians

### 3. **Payment Confirmation Flow** ✅

- Post-payment verification
- Order status updates
- Stock reduction after payment
- Earnings distribution to beauticians
- Email notifications (configured in Stripe)

### 4. **User Experience** 🎨

- Animated loading states
- Success/error feedback
- Automatic redirection
- Order confirmation page
- Cancel/retry options

## Payment Flow

### Step-by-Step Process

1. **Customer adds products to cart**

   - Products can be from different beauticians
   - Cart stored in Redux state

2. **Customer proceeds to checkout** (`/product-checkout`)

   - Fills shipping information
   - Reviews order summary
   - Clicks "Place Order"

3. **Frontend creates checkout session**

   ```javascript
   POST /api/orders/checkout
   {
     items: [...],
     shippingAddress: {...},
     notes: "..."
   }
   ```

4. **Backend creates Stripe session**

   - Validates products and stock
   - Calculates totals (subtotal, shipping, tax)
   - Creates pending order in database
   - Groups items by beautician
   - Creates Stripe Checkout session
   - Returns session URL

5. **Customer redirected to Stripe**

   - Stripe handles payment form
   - Secure card processing
   - 3D Secure (SCA) compliance
   - Customer completes payment

6. **Stripe redirects back**

   - **Success**: → `/shop/success?session_id=xxx&orderId=xxx`
   - **Cancel**: → `/shop/cancel?orderId=xxx`

7. **Frontend confirms payment**

   ```javascript
   GET /api/orders/confirm-checkout?session_id=xxx&orderId=xxx
   ```

8. **Backend processes confirmation**

   - Verifies payment with Stripe
   - Updates order status to "processing"
   - Reduces product stock
   - Distributes payments to beauticians
   - Updates beautician earnings

9. **Customer sees success page**
   - Order confirmation
   - Order details
   - Tracking information (when available)

## Technical Implementation

### Frontend Files

#### **ProductCheckoutPage.jsx** (Modified)

```javascript
// Changed from direct order creation to Stripe checkout
const response = await OrdersAPI.createCheckout({
  items: orderItems,
  shippingAddress: {...},
  notes: formData.notes,
});

// Redirect to Stripe
window.location.href = response.url;
```

#### **orders.api.js** (Modified)

```javascript
async createCheckout(data) {
  const response = await api.post("/orders/checkout", data);
  return response.data; // { url, sessionId, orderId }
},

async confirmCheckout(sessionId, orderId) {
  const response = await api.get(
    `/orders/confirm-checkout?session_id=${sessionId}&orderId=${orderId}`
  );
  return response.data; // { success, order }
}
```

#### **ShopSuccessPage.jsx** (NEW)

- Confirms payment with backend
- Shows animated loading state
- Auto-redirects to order details
- Handles errors gracefully

#### **ShopCancelPage.jsx** (NEW)

- Friendly cancellation message
- Options to retry or continue shopping
- Explains what happened
- Contact support link

### Backend Files

#### **routes/orders.js** (Existing)

Key endpoints:

- `POST /api/orders/checkout` - Create Stripe session
- `GET /api/orders/confirm-checkout` - Confirm payment
- Stripe Connect payment distribution
- Stock management
- Earnings tracking

### Route Configuration

#### **routes.jsx** (Modified)

```jsx
<Route path="/shop/success" element={<ShopSuccessPage />} />
<Route path="/shop/cancel" element={<ShopCancelPage />} />
```

## Stripe Connect Payment Distribution

### Single-Beautician Orders

```javascript
// Uses destination charges
payment_intent_data: {
  on_behalf_of: beauticianStripeAccount,
  application_fee_amount: 0,
  transfer_data: {
    destination: beauticianStripeAccount
  }
}
```

- Beautician receives payment directly
- Beautician pays Stripe fees
- Platform takes no commission on products

### Multi-Beautician Orders

```javascript
// Platform receives payment, then transfers
for (const payment of stripeConnectPayments) {
  await stripe.transfers.create({
    amount: payment.amount * 100,
    currency: "gbp",
    destination: beauticianStripeAccount,
    transfer_group: `ORDER_${orderId}`,
  });
}
```

- Platform pays Stripe fees
- Separate transfer to each beautician
- Transfers happen after payment confirmation

### Platform-Owned Products

- Direct payment to platform account
- No Connect transfers needed
- Platform keeps 100% (minus Stripe fees)

## Order States

### Payment Status

- `pending` - Order created, awaiting payment
- `paid` - Payment confirmed
- `refunded` - Payment refunded

### Order Status

- `pending` - Waiting for payment
- `processing` - Payment confirmed, preparing order
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `refunded` - Order refunded

## Calculations

### Pricing

```javascript
subtotal = Σ(item.price × item.quantity)
shipping = subtotal >= 50 ? 0 : 5.99  // Free shipping over £50
tax = subtotal × 0.20  // 20% VAT
total = subtotal + shipping + tax
```

### Stripe Amounts

```javascript
// Convert to pence (Stripe uses smallest currency unit)
stripeAmount = Math.round(gbpAmount * 100);
```

## Error Handling

### Frontend Errors

1. **Cart empty**: Redirect to products page
2. **Checkout creation failed**: Show error toast, allow retry
3. **Payment confirmation failed**: Show error page with support link
4. **Missing session_id**: Error state

### Backend Errors

1. **Product not found**: 400 error with details
2. **Insufficient stock**: 400 error with availability
3. **Stripe API error**: 500 error logged
4. **Payment verification failed**: 400 error

## Testing Checklist

- [ ] Add products to cart (single beautician)
- [ ] Add products to cart (multiple beauticians)
- [ ] Proceed to checkout
- [ ] Fill shipping information
- [ ] Click "Place Order"
- [ ] Redirected to Stripe
- [ ] Complete payment with test card (4242 4242 4242 4242)
- [ ] Redirected to success page
- [ ] Payment confirmation shows loading
- [ ] Redirected to order details
- [ ] Order status is "processing"
- [ ] Stock reduced correctly
- [ ] Beautician earnings updated (if applicable)
- [ ] Try canceling payment on Stripe
- [ ] Redirected to cancel page
- [ ] Cart still has items
- [ ] Can retry checkout
- [ ] Test with logged-in user (userId attached)
- [ ] Test as guest (no userId)
- [ ] Test free shipping threshold (£50)
- [ ] Test VAT calculation (20%)

## Stripe Test Cards

### Successful Payments

- **4242 4242 4242 4242** - Visa
- **5555 5555 5555 4444** - Mastercard
- Use any future expiry date
- Use any 3-digit CVC
- Use any postal code

### Failed Payments

- **4000 0000 0000 0002** - Card declined
- **4000 0000 0000 9995** - Insufficient funds

### 3D Secure

- **4000 0027 6000 3184** - Requires 3DS authentication

## Environment Variables

### Backend (.env)

```
STRIPE_SECRET=sk_test_...
STRIPE_CURRENCY=gbp
FRONTEND_URL=http://localhost:5174
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:4000/api
```

## Security Considerations

1. **Payment Processing**: All handled by Stripe (PCI compliant)
2. **No Card Details**: Never touch customer's card data
3. **Session Verification**: Confirm payment with Stripe API
4. **Stock Validation**: Check availability before creating session
5. **Amount Verification**: Stripe session amounts match order totals

## Refunds

Refunds are handled by the admin panel:

```javascript
POST /api/orders/:id/refund
{
  reason: "Customer request"
}
```

Features:

- Reverses Stripe charge
- Reverses transfers to beauticians
- Updates beautician earnings
- Restores product stock
- Updates order status

## User Experience Flow

### Success Flow

```
Cart → Checkout Form → Stripe Payment → Processing Screen → Success Screen → Order Details
```

### Cancel Flow

```
Cart → Checkout Form → Stripe Payment → Cancel Button → Cancel Page → Retry or Shop
```

### Error Flow

```
Cart → Checkout Form → Stripe Payment → Payment Fails → Error Screen → Support Link
```

## Admin Product Management

### Assigning Products to Beauticians

When creating or editing a product in the admin panel (`/admin/products`), you can assign ownership:

1. **Product Owner Field**: Select a beautician or leave as "Platform"
2. **Beautician List**: Shows all active beauticians
3. **Stripe Status Indicator**: ✓ indicates beautician is connected to Stripe
4. **Visual Tags**:
   - 💰 "Beautician Product" - Owned by specific beautician
   - 🏢 "Platform Product" - Owned by platform
   - Owner name displayed below product title

**Important Notes**:

- Only beauticians with `stripeStatus: "connected"` can receive payments
- Beauticians without Stripe accounts will still appear but show "(Not connected to Stripe)"
- Platform products (no beautician assigned) go 100% to platform account
- You can change product ownership at any time

## Benefits

1. **Secure**: Stripe handles all sensitive payment data
2. **Fast**: Redirects minimize loading times
3. **Flexible**: Supports multiple beauticians per order
4. **Transparent**: Clear fee structure for beauticians
5. **Compliant**: PCI DSS, SCA, GDPR compliant via Stripe
6. **Trackable**: Full order and payment history
7. **Recoverable**: Failed payments can be retried
8. **Refundable**: Easy refund process for admins
9. **Multi-Seller**: Supports beautician-owned products with automatic payment distribution

## Future Enhancements

Possible improvements:

- [ ] Stripe Elements (embedded checkout)
- [ ] Apple Pay / Google Pay integration
- [ ] Save cards for logged-in users
- [ ] Subscription products
- [ ] Partial refunds
- [ ] Order tracking emails
- [ ] Abandoned cart recovery
- [ ] Invoice generation (PDF)
- [ ] Multi-currency support
- [ ] Gift cards / discount codes
- [ ] Pre-order functionality
- [ ] Backorder management

## Troubleshooting

### "Payment not completed" error

- Check Stripe dashboard for session status
- Verify payment_intent status is "succeeded"
- Check webhook logs for failures

### Stock not reduced

- Verify payment confirmation endpoint called
- Check order status is "paid"
- Review stock update logic in backend

### Beautician not receiving earnings

- Verify beautician.stripeStatus === "connected"
- Check Stripe Connect account status
- Review transfer logs in Stripe dashboard

### Customer charged but order pending

- Run confirmation endpoint manually
- Check Stripe webhook configuration
- Contact Stripe support if persistent

## Related Documentation

- `STRIPE_CONNECT_COMPLETE.md` - Stripe Connect setup
- `ADMIN_NAVIGATION_REORGANIZATION.md` - Admin Stripe settings
- `PRODUCTS_CATALOG_PAGE.md` - Product browsing

---

**Status**: ✅ Complete and production-ready
**Last Updated**: November 4, 2025
**Version**: 1.0.0
