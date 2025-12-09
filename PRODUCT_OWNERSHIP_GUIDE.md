# Product Ownership & Payment Distribution Guide

## Overview

The beauty salon platform supports **multi-seller product sales** with automatic payment distribution through Stripe Connect. Products can be owned by:

- 🏢 **Platform** (salon business)
- 💅 **Individual Specialists** (connected via Stripe Connect)

## How It Works

### Database Structure

Each product has an optional `specialistId` field:

```javascript
// Product Model
{
  specialistId: {
    type: Schema.Types.ObjectId,
    ref: "Specialist",
    default: null  // null = platform-owned
  }
}
```

### Payment Flow by Ownership Type

#### 1. Platform Products (`specialistId: null`)

```
Customer pays £100
→ Platform receives £100 (minus Stripe fees ~2.9%)
→ No transfers needed
```

#### 2. Single Specialist Products

```
Customer buys 2 products from Specialist A (£100 total)
→ Stripe Checkout with destination charges
→ Specialist A receives £100 directly
→ Specialist A pays Stripe fees
→ Platform takes no commission
```

#### 3. Multi-Specialist Orders

```
Customer buys:
- Product A from Specialist A (£50)
- Product B from Specialist B (£30)
- Product C from Platform (£20)

→ Platform receives £100 total
→ Platform pays Stripe fees
→ Platform transfers £50 to Specialist A
→ Platform transfers £30 to Specialist B
→ Platform keeps £20
```

## Admin: Assigning Product Ownership

### Step-by-Step

1. **Navigate to Products Page**

   - Go to Admin Panel → Products

2. **Create or Edit Product**

   - Click "Add New Product" or "Edit" on existing product

3. **Select Product Owner**

   - Find "Product Owner" dropdown (below Category)
   - Options:
     - "Platform (No Specialist)" - Default, platform-owned
     - Each active specialist with Stripe status
   - Look for ✓ checkmark indicating Stripe connected

4. **Save Product**
   - Click "Create Product" or "Update Product"
   - Ownership is now set

### Visual Indicators

**In Product List:**

- **Purple Badge**: "💰 Specialist Product"
- **Blue Badge**: "🏢 Platform Product"
- **Owner Name**: Shows below product title (if specialist-owned)

**In Dropdown:**

- **Connected**: "Jane Smith ✓"
- **Not Connected**: "Sarah Lee (Not connected to Stripe)"

### Important Notes

⚠️ **Stripe Connect Required**

- Only specialists with `stripeStatus: "connected"` can receive payments
- Admin must connect specialist via Stripe Connect Settings
- Products can still be assigned to unconnected specialists (payments will fail)

💡 **Best Practice**

- Verify specialist is Stripe connected before assigning products
- Check Stripe Connect status in Admin → Stripe Connect page

## Customer Experience

Customers don't see ownership - they simply shop products. The system automatically:

1. Groups items by specialist during checkout
2. Calculates payment splits
3. Creates Stripe Checkout session
4. Processes payment
5. Distributes funds to specialists
6. Updates earnings tracking

## Specialist Benefits

### Automatic Features

- ✅ Direct payments via Stripe Connect
- ✅ Earnings tracked in `totalEarnings` field
- ✅ Transparent payment history
- ✅ No manual invoicing needed
- ✅ Professional payment processing

### Viewing Earnings

Specialists can view their earnings:

1. Admin → Revenue page
2. Filter by specialist
3. See product sales vs service bookings
4. View Stripe Connect transfer history

## Technical Details

### Backend Processing

**Checkout Creation** (`POST /api/orders/checkout`):

```javascript
// Groups items by specialist
const itemsByBeautician = new Map();
for (const item of validatedItems) {
  const specialistId = item.specialistId?.toString() || "platform";
  itemsByBeautician.set(specialistId, [...items]);
}

// Tracks expected payments
stripeConnectPayments.push({
  specialistId,
  beauticianStripeAccount: specialist.stripeAccountId,
  amount: itemsTotal,
  status: "pending",
});
```

**Payment Confirmation** (`GET /api/orders/confirm-checkout`):

```javascript
// For each specialist payment
for (const payment of order.stripeConnectPayments) {
  // Single-specialist: destination charge already handled
  // Multi-specialist: create transfer
  const transfer = await stripe.transfers.create({
    amount: payment.amount * 100,
    destination: specialist.stripeAccountId,
    transfer_group: `ORDER_${order._id}`,
  });

  // Update earnings
  await Specialist.findByIdAndUpdate(specialist._id, {
    $inc: { totalEarnings: payment.amount },
  });
}
```

### Order Data Structure

```javascript
{
  items: [
    {
      productId: "...",
      title: "Product Name",
      price: 50.00,
      quantity: 1,
      specialistId: "abc123"  // ← Tracks ownership
    }
  ],
  stripeConnectPayments: [
    {
      specialistId: "abc123",
      beauticianStripeAccount: "acct_...",
      amount: 50.00,
      status: "succeeded",
      transferId: "tr_..."
    }
  ]
}
```

## Troubleshooting

### Product Payment Not Received

**Symptom**: Specialist didn't receive payment for their product

**Checklist**:

1. ✅ Is specialist connected to Stripe? (Admin → Stripe Connect)
2. ✅ Is product assigned to specialist? (Check Product Owner field)
3. ✅ Did customer complete payment? (Check order status = "paid")
4. ✅ Check Stripe Dashboard for transfer/destination charge
5. ✅ Check `order.stripeConnectPayments` array

**Common Issues**:

- Specialist not connected → Payment fails, stays in platform account
- Product `specialistId` is null → Payment goes to platform (expected)
- Stripe Connect account restricted → Transfer fails

### Changing Product Ownership

**Can I change ownership after product is sold?**

- ✅ Yes, you can change for future orders
- ⚠️ Past orders keep original ownership
- Past payments won't be redistributed

**Steps**:

1. Go to Admin → Products
2. Click Edit on product
3. Change "Product Owner" dropdown
4. Click "Update Product"
5. New orders will use new ownership

### Platform vs Specialist Products

**When to use Platform ownership:**

- Salon-branded merchandise
- Supplies for in-salon use only
- Products the salon buys wholesale
- Shared inventory items

**When to use Specialist ownership:**

- Products specialist sources independently
- Personal brand products
- Exclusive items specialist created
- Specialist wants direct payment

## Related Documentation

- `PRODUCT_PAYMENT_INTEGRATION.md` - Full Stripe integration details
- `STRIPE_CONNECT_COMPLETE.md` - Stripe Connect setup guide
- `ADMIN_NAVIGATION_REORGANIZATION.md` - Admin panel structure

---

**Status**: ✅ Feature Complete
**Last Updated**: November 4, 2025
**Version**: 1.0.0
