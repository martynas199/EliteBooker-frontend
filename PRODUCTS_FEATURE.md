# Products & Popular Collections Feature

## Overview

Complete product management system with admin CRUD interface and customer-facing "Popular Collections" display section.

## Features Implemented

### 1. Backend (Node.js/Express/MongoDB)

#### Product Model (`src/models/Product.js`)

**Fields:**

- `title` - Product name (required)
- `description` - Detailed description (required)
- `keyBenefits` - Array of benefits (one per line in admin)
- `ingredients` - Full ingredient list
- `howToApply` - Application instructions
- `size` - Product size (e.g., "50ml", "100g")
- `price` - Current selling price (required)
- `originalPrice` - Original price (for showing discounts)
- `image` - Product image (Cloudinary upload)
- `category` - Product category (Skincare, Makeup, Fragrance, etc.)
- `featured` - Boolean flag for "Popular Collections"
- `active` - Visibility toggle
- `order` - Display order (lower = first)
- `stock` - Stock quantity

#### API Routes (`src/routes/products.js`)

- `GET /api/products` - List all products (with filters)
  - Query params: `featured=true`, `category=Skincare`, `active=true`
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (with Cloudinary cleanup)
- `POST /api/products/:id/upload-image` - Upload product image

**Registered in server.js:** `app.use("/api/products", productsRouter)`

### 2. Frontend Components

#### Products API Client (`features/products/products.api.js`)

- `list(params)` - Fetch products with optional filters
- `get(id)` - Fetch single product
- `create(data)` - Create new product
- `update(id, data)` - Update product
- `delete(id)` - Delete product
- `uploadImage(id, file)` - Upload product image

#### ProductCard Component (`features/products/ProductCard.jsx`)

**Features:**

- Product image with hover scale effect
- "SALE" badge for discounted items
- Product title (Playfair Display font)
- Price display with strikethrough for original price
- Size display
- Click handler for future modal/details page

**Design:** Matches the provided reference image with clean card layout

#### PopularCollections Component (`features/products/PopularCollections.jsx`)

**Features:**

- Displays only `featured: true` and `active: true` products
- "OUR POPULAR COLLECTIONS" heading (uppercase, Playfair Display)
- Responsive grid: 2 columns mobile, 3 columns tablet, 4 columns desktop
- Loading state
- Auto-hides if no featured products

**Location:** Services page, below hero sections, above services list

### 3. Admin Interface

#### Products Management Page (`admin/pages/Products.jsx`)

**Features:**

- Complete CRUD interface
- Comprehensive form with all product fields:
  - Title, Category, Size, Price, Original Price
  - Stock Quantity, Display Order
  - Description, Key Benefits (textarea)
  - Ingredients, How to Apply
  - Image upload with preview
  - Featured toggle (for Popular Collections)
  - Active toggle (visibility)

**Product List View:**

- Grid display of all products
- Shows thumbnail, title, category, size
- Price with original price strikethrough
- Featured and Active badges
- Edit and Delete buttons
- Hover effects

**Image Upload:**

- File picker with preview
- Uploads to Cloudinary
- Automatic cleanup of old images
- Supports standard image formats

**Navigation:**

- Added to admin menu as "Products 🛍️"
- Located after "Hero Sections"
- Route: `/admin/products`

### 4. Integration

#### Services Page (`features/services/ServicesPage.jsx`)

**Layout Order:**

1. Hero banner (salon image, name, address, hours)
2. Hero Sections (custom 3-box layouts)
3. **Popular Collections** ← NEW
4. Services list with category filters

**Styling:** Matches site design with proper spacing and max-width container

## Usage Instructions

### For Admins:

1. **Access Products Management:**

   - Go to admin panel
   - Click "Products 🛍️" in sidebar

2. **Create a Product:**

   - Fill in all required fields (title, description, size, price)
   - Add optional fields (benefits, ingredients, how to apply)
   - Upload product image
   - Set category
   - Check "Featured in Popular Collections" to show on homepage
   - Click "Create Product"

3. **Upload Product Image:**

   - Select image file during creation, or
   - Edit existing product and upload new image
   - Images automatically uploaded to Cloudinary

4. **Feature Products:**

   - Edit product
   - Check "Featured in Popular Collections"
   - Set "Display Order" (lower numbers appear first)
   - Featured products appear in the Popular Collections section

5. **Manage Visibility:**
   - Uncheck "Active" to hide from customers
   - Product remains in admin but won't show on site

### For Customers:

**Popular Collections Section:**

- Visible on services page
- Shows featured products in elegant grid
- Click product for details (future feature)
- Shows sale prices with strikethrough

## Database Schema

```javascript
{
  title: String (required),
  description: String (required),
  keyBenefits: [String],
  ingredients: String,
  howToApply: String,
  size: String (required),
  price: Number (required),
  originalPrice: Number,
  image: {
    url: String,
    publicId: String,
    provider: String
  },
  category: String (default: "General"),
  featured: Boolean (default: false),
  active: Boolean (default: true),
  order: Number (default: 0),
  stock: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Categories

Pre-configured categories:

- Skincare
- Makeup
- Fragrance
- Haircare
- Body Care
- Tools & Accessories

## Design Features

**Card Design:**

- Clean white background
- Square aspect ratio images
- Hover scale effect on images
- Gold price color (#76540E)
- Sale badge for discounts
- Responsive spacing

**Admin Interface:**

- Two-column form layout on desktop
- Image preview before upload
- Status badges (Featured, Inactive)
- Inline editing with scroll-to-top
- Delete confirmation modal

## Technical Details

**Image Storage:** Cloudinary
**File Handling:** Multer with disk storage
**Database:** MongoDB with Mongoose
**Frontend:** React with hooks
**Styling:** Tailwind CSS + custom gold theme
**Fonts:** Playfair Display for headings

## Future Enhancements

Potential additions:

- Product detail modal or page
- Shopping cart integration
- Product reviews/ratings
- Related products
- Product search and filters
- Inventory tracking
- Multiple product images
- Product variants (colors, sizes)
- SEO optimization
