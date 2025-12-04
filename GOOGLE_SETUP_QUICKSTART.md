# Quick Start: Google Search Console & Analytics Setup

## 🚀 Google Search Console (CRITICAL - Do This First!)

### Step 1: Verify Ownership

1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `https://www.nobleelegance.co.uk`
4. Choose verification method: **HTML tag** (already added to your index.html)
5. The meta tag is already in your `index.html`:
   ```html
   <meta
     name="google-site-verification"
     content="PH-qR9KCoshWcHRk4y2_tpC0AiW5_ocmwSoU6wAesEk"
   />
   ```
6. Click "Verify"

### Step 2: Submit Sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter sitemap URL: `https://www.nobleelegance.co.uk/sitemap.xml`
3. Click "Submit"
4. Wait 24-48 hours for Google to crawl

### Step 3: Request Indexing

1. Go to **URL Inspection** tool
2. Enter your homepage URL
3. Click "Request Indexing"
4. Repeat for key pages:
   - `/beauticians`
   - `/products`
   - `/about`
   - `/salon`

### Step 4: Monitor (Check Weekly)

- **Coverage**: Check for indexing errors
- **Performance**: Monitor clicks, impressions, CTR
- **Mobile Usability**: Fix any mobile issues
- **Core Web Vitals**: Track performance metrics

---

## 📊 Google Analytics 4 Setup

### Step 1: Create Property

1. Go to: https://analytics.google.com
2. Click "Admin" (bottom left)
3. Click "+ Create Property"
4. Property name: "Noble Elegance Beauty Salon"
5. Time zone: UK
6. Currency: GBP
7. Create property

### Step 2: Add Data Stream

1. Click "Web" under Data Streams
2. Website URL: `https://www.nobleelegance.co.uk`
3. Stream name: "Noble Elegance Website"
4. Enhanced measurement: **Enable all**
5. Create stream

### Step 3: Install Tracking Code

Copy the Measurement ID (looks like `G-XXXXXXXXXX`)

**Option A: Direct Installation (Recommended)**
Add to `index.html` in `<head>`:

```html
<!-- Google tag (gtag.js) -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

**Option B: Google Tag Manager (Advanced)**

1. Create GTM account: https://tagmanager.google.com
2. Add GTM container code to index.html
3. Add GA4 tag in GTM dashboard

### Step 4: Set Up Conversions

1. Go to **Events** in GA4
2. Mark as conversions:
   - `purchase` (product orders)
   - `begin_checkout` (checkout started)
   - `add_to_cart` (cart additions)
   - Custom: `booking_completed` (appointment booked)

### Step 5: Create Custom Events (Optional)

Add event tracking to key actions:

```javascript
// When user books appointment
gtag("event", "booking_completed", {
  service_name: serviceName,
  beautician: beauticianName,
  price: price,
});

// When user adds to cart
gtag("event", "add_to_cart", {
  item_name: productName,
  price: price,
});

// When user clicks phone number
gtag("event", "phone_click", {
  location: "header",
});
```

---

## 📍 Google Business Profile Setup

### Step 1: Claim Business

1. Go to: https://business.google.com
2. Search for "Noble Elegance Beauty Salon Huntingdon"
3. If exists: Click "Claim this business"
4. If not: Click "Add your business"

### Step 2: Verify Business

Choose verification method:

- **Postcard** (most common - 5-7 days)
- **Phone** (if available)
- **Email** (if available)

### Step 3: Complete Profile (100%)

**Business Information:**

- Business name: Noble Elegance Beauty Salon
- Category: Beauty Salon (Primary)
- Add secondary: Permanent Makeup Service, Day Spa
- Address: [YOUR ACTUAL ADDRESS]
- Service area: Huntingdon, Peterborough, March, Wisbech, St Ives, Ramsey
- Phone: [YOUR ACTUAL PHONE]
- Website: https://www.nobleelegance.co.uk
- Appointment URL: https://www.nobleelegance.co.uk/beauticians

**Opening Hours:**
Add your actual hours for each day

**Business Description:**

```
Premier beauty salon in Huntingdon, Cambridgeshire specializing in permanent makeup, microblading, brows, lashes and professional beauty treatments. We serve Huntingdon, Peterborough, March, Wisbech and surrounding areas. Book your appointment online today!
```

**Services:**
Add all services with descriptions and prices:

- Permanent Makeup
- Microblading
- Eyebrow Tinting & Shaping
- Eyelash Extensions
- Beauty Treatments
- [Add all your services]

**Photos:**
Upload minimum 10 photos:

- Logo (required)
- Cover photo (required)
- Salon exterior
- Salon interior
- Treatment rooms
- Staff at work
- Before/After (if allowed)
- Products sold

**Attributes:**
Select all that apply:

- ✓ Women-led
- ✓ Online appointments
- ✓ Wheelchair accessible (if true)
- ✓ Free Wi-Fi (if true)
- ✓ On-site parking (if true)

### Step 4: Get Reviews

1. Share review link with customers
2. Find link in GMB dashboard: "Get more reviews"
3. Respond to ALL reviews within 24 hours
4. Thank positive reviews
5. Address negative reviews professionally

**Review Request Template:**

```
Thank you for choosing Noble Elegance! We'd love to hear about your experience.
Please take a moment to leave us a review: [REVIEW LINK]
```

### Step 5: Post Regularly

Post 2-3 times per week:

- Special offers
- New services
- Before/after photos
- Beauty tips
- Seasonal promotions

---

## ✅ Verification Checklist

Print this and check off as you complete:

### Google Search Console

- [ ] Property added and verified
- [ ] Sitemap submitted
- [ ] Homepage indexed
- [ ] Key pages requested for indexing
- [ ] No coverage errors
- [ ] Mobile usability OK

### Google Analytics 4

- [ ] Property created
- [ ] Data stream added
- [ ] Tracking code installed
- [ ] Real-time data showing
- [ ] Conversions configured
- [ ] Events tracking correctly

### Google Business Profile

- [ ] Business claimed
- [ ] Business verified
- [ ] Profile 100% complete
- [ ] Photos uploaded (10+)
- [ ] Services added
- [ ] Opening hours set
- [ ] Description added
- [ ] Appointment link added
- [ ] First post published
- [ ] Review link obtained

### Website Updates Needed

- [ ] Replace placeholder address in schema
- [ ] Replace placeholder phone in schema
- [ ] Add real opening hours to schema
- [ ] Add social media URLs to schema
- [ ] Test all pages on mobile
- [ ] Check all images have alt text
- [ ] Verify internal links work
- [ ] Test booking flow end-to-end

---

## 📱 Testing & Validation

### Test Your Implementation

1. **Rich Results Test:**

   - Go to: https://search.google.com/test/rich-results
   - Test each page URL
   - Verify schema appears correctly

2. **Mobile-Friendly Test:**

   - Go to: https://search.google.com/test/mobile-friendly
   - Test homepage and key pages
   - Fix any issues found

3. **PageSpeed Insights:**

   - Go to: https://pagespeed.web.dev
   - Test desktop and mobile
   - Aim for 90+ score on both

4. **Structured Data Validator:**
   - Go to: https://validator.schema.org
   - Copy page source
   - Paste and validate
   - Fix any errors

---

## 🎯 Week 1 Priorities

### Day 1-2:

- [ ] Verify Google Search Console
- [ ] Submit sitemap
- [ ] Request indexing for all pages

### Day 3-4:

- [ ] Set up Google Analytics 4
- [ ] Install tracking code
- [ ] Test events firing

### Day 5-7:

- [ ] Claim Google Business Profile
- [ ] Complete profile 100%
- [ ] Upload photos
- [ ] Publish first post

---

## 📞 Need Help?

### Google Support:

- Search Console Help: https://support.google.com/webmasters
- Analytics Help: https://support.google.com/analytics
- Business Profile Help: https://support.google.com/business

### Testing Tools:

- Google Search Console: https://search.google.com/search-console
- Rich Results Test: https://search.google.com/test/rich-results
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- PageSpeed Insights: https://pagespeed.web.dev
- Schema Validator: https://validator.schema.org

---

**Remember:** SEO is a long-term strategy. You won't see results overnight, but consistent effort over 3-6 months will significantly improve your rankings and organic traffic!

**Last Updated:** November 20, 2025
