# Cypress E2E Testing Suite

Complete end-to-end testing suite for the multi-tenant booking system using Cypress.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Custom Commands](#custom-commands)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This E2E testing suite validates the complete functionality of the multi-tenant booking platform, including:

- Multi-tenant isolation and routing
- Admin and super admin access control
- Service and staff management
- Smart time slot generation
- Guest and registered user checkout flows
- Stripe Connect payment processing
- SEO implementation

## ✅ Test Coverage

### 1. Multi-Tenant Routing (`01-multi-tenant-routing.cy.js`)

- ✅ Tenant landing page loads with correct branding
- ✅ Services and staff are tenant-specific
- ✅ Data isolation between tenants
- ✅ URL routing maintains tenant context
- ✅ API requests include correct tenant headers

### 2. Admin Access & Security (`02-admin-access-security.cy.js`)

- ✅ Tenant admin dashboard access
- ✅ Super admin platform dashboard
- ✅ 401 errors for unauthorized access
- ✅ 403 errors for forbidden resources
- ✅ Cross-tenant data isolation
- ✅ Role-based access control

### 3. Guest Checkout Flow (`03-guest-checkout-flow.cy.js`)

- ✅ Complete booking flow: service → staff → time → details → payment
- ✅ Form validation
- ✅ Payment cancellation handling
- ✅ Mobile responsiveness
- ✅ Edge cases (no slots, service not found)

### 4. Time Slot Generator (`04-time-slot-generator.cy.js`)

- ✅ Working hours consideration
- ✅ Break time exclusion
- ✅ Existing bookings consideration
- ✅ Service duration calculation
- ✅ Time off handling
- ✅ Timezone correctness

### 5. SEO Tests (`05-seo-tests.cy.js`)

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Canonical URLs
- ✅ Structured data (JSON-LD)
- ✅ Sitemap accessibility
- ✅ Semantic HTML structure

### 6. Stripe Payments (`06-stripe-payments.cy.js`)

- ✅ Successful full payment
- ✅ Successful deposit payment
- ✅ Platform fee calculation (50p)
- ✅ Connected account payout
- ✅ Failed payment handling
- ✅ Payment amount verification

## 🚀 Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB running
- Backend and frontend servers set up

### Install Dependencies

```bash
cd booking-frontend
npm install
```

Cypress and testing libraries are already included in `devDependencies`.

## ⚙️ Configuration

### 1. Environment Variables

Create `.env.test` files:

**Backend (`booking-backend/.env.test`):**

```bash
cp booking-backend/.env.test.example booking-backend/.env.test
```

Edit and add your test credentials:

- MongoDB test database URL
- Stripe test mode keys
- JWT secret

**Frontend (`booking-frontend/.env.test`):**

```bash
cp booking-frontend/.env.test.example booking-frontend/.env.test
```

Edit and add:

- API URL
- Stripe public key (test mode)

### 2. Cypress Configuration

The `cypress.config.js` file is already configured with:

- Base URL: `http://localhost:5173`
- API URL: `http://localhost:5000`
- Video recording enabled
- Screenshot on failure
- Test retries (2 in CI, 0 locally)

### 3. Test Data Seeding

Seed the database with test data:

```bash
cd booking-backend
node scripts/seedTestData.js
```

This creates:

- 2 test tenants (salon1, salon2)
- Super admin, tenant admins, and regular users
- Services and staff for each tenant

**Test Credentials:**

- Super Admin: `superadmin@platform.com` / `SuperAdmin123!`
- Tenant Admin: `admin@salon1.com` / `TenantAdmin123!`
- Regular User: `user@example.com` / `User123!`

## 🏃 Running Tests

### Prerequisites - Start Servers

**Terminal 1 - Backend:**

```bash
cd booking-backend
npm start
```

**Terminal 2 - Frontend:**

```bash
cd booking-frontend
npm run dev
```

### Run All Tests

**Terminal 3 - Tests:**

```bash
cd booking-frontend

# Headless mode (CI-style)
npm run test:e2e

# Interactive mode (Cypress UI)
npm run test:e2e:open

# Headed mode (see browser)
npm run test:e2e:headed

# Specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox

# Single test file
npm run test:e2e:spec cypress/e2e/01-multi-tenant-routing.cy.js
```

### Run Individual Test Suites

```bash
# Multi-tenant routing
npx cypress run --spec "cypress/e2e/01-multi-tenant-routing.cy.js"

# Admin & security
npx cypress run --spec "cypress/e2e/02-admin-access-security.cy.js"

# Guest checkout
npx cypress run --spec "cypress/e2e/03-guest-checkout-flow.cy.js"

# Time slots
npx cypress run --spec "cypress/e2e/04-time-slot-generator.cy.js"

# SEO
npx cypress run --spec "cypress/e2e/05-seo-tests.cy.js"

# Payments
npx cypress run --spec "cypress/e2e/06-stripe-payments.cy.js"
```

## 📁 Test Structure

```
cypress/
├── e2e/                          # Test files
│   ├── 01-multi-tenant-routing.cy.js
│   ├── 02-admin-access-security.cy.js
│   ├── 03-guest-checkout-flow.cy.js
│   ├── 04-time-slot-generator.cy.js
│   ├── 05-seo-tests.cy.js
│   └── 06-stripe-payments.cy.js
├── fixtures/                     # Test data
│   ├── tenants.json
│   ├── users.json
│   ├── services.json
│   └── staff.json
├── support/                      # Helper files
│   ├── commands.js              # Custom commands
│   └── e2e.js                   # Global config
├── videos/                       # Test recordings
├── screenshots/                  # Failure screenshots
└── config/                       # Additional configs
```

## 🛠️ Custom Commands

### Authentication

```javascript
// Login as tenant admin
cy.loginAsTenantAdmin("admin@salon1.com", "TenantAdmin123!");

// Login as super admin
cy.loginAsSuperAdmin("superadmin@platform.com", "SuperAdmin123!");

// Login via UI
cy.loginViaUI("user@example.com", "User123!");

// Logout
cy.logout();
```

### Tenant Management

```javascript
// Create tenant
cy.createTenant({
  name: "Test Salon",
  slug: "test-salon",
  email: "test@salon.com",
});

// Get tenant by slug
cy.getTenantBySlug("salon1");

// Update tenant
cy.updateTenant(tenantId, { name: "New Name" });

// Delete tenant
cy.deleteTenant(tenantId);
```

### Staff Management

```javascript
// Create staff
cy.createStaff(
  {
    name: "John Doe",
    email: "john@salon.com",
    specialties: ["Hair"],
  },
  "salon1"
);

// Update staff
cy.updateStaff(staffId, { name: "Jane Doe" }, "salon1");

// Set availability
cy.setStaffAvailability(
  staffId,
  {
    monday: { start: "09:00", end: "17:00", enabled: true },
  },
  "salon1"
);
```

### Service Management

```javascript
// Create service
cy.createService(
  {
    name: "Haircut",
    price: 5000,
    duration: 60,
  },
  "salon1"
);

// Update service
cy.updateService(serviceId, { price: 6000 }, "salon1");

// Delete service
cy.deleteService(serviceId, "salon1");
```

### Booking & Time Slots

```javascript
// Get available slots
cy.getAvailableSlots(serviceId, staffId, "2024-12-01", "salon1");

// Create booking
cy.createBooking(
  {
    serviceId,
    beauticianId: staffId,
    start: "2024-12-01T10:00:00Z",
    customerName: "Test User",
    customerEmail: "test@example.com",
  },
  "salon1"
);
```

### Stripe Payments

```javascript
// Initiate checkout
cy.initiateStripeCheckout(
  {
    serviceId,
    beauticianId: staffId,
    start: "2024-12-01T10:00:00Z",
    paymentMode: "full",
  },
  "salon1"
);

// Complete payment (test card)
cy.completeStripeTestPayment();

// Complete failed payment
cy.completeStripeTestPaymentFail();
```

### Utilities

```javascript
// Seed database
cy.seedDatabase();

// Clean database
cy.cleanDatabase();

// Wait for API
cy.waitForAPI("@apiAlias");

// Check console errors
cy.checkConsoleErrors();
```

## 🔄 CI/CD Integration

### GitHub Actions

The CI pipeline (`.github/workflows/cypress-e2e.yml`) automatically:

1. ✅ Spins up MongoDB service
2. ✅ Installs dependencies
3. ✅ Seeds test database
4. ✅ Starts backend and frontend servers
5. ✅ Runs Cypress tests in parallel (3 containers)
6. ✅ Uploads screenshots on failure
7. ✅ Uploads videos for all tests
8. ✅ Generates test reports

### Running in CI

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via GitHub Actions UI

### Required Secrets

Add these to GitHub repository secrets:

```
STRIPE_TEST_SECRET_KEY
STRIPE_TEST_PUBLIC_KEY
STRIPE_TEST_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CYPRESS_RECORD_KEY (optional - for Cypress Dashboard)
```

## 🐛 Troubleshooting

### Tests Failing to Start

**Issue:** Cypress can't connect to servers

**Solution:**

```bash
# Check servers are running
curl http://localhost:5000/health
curl http://localhost:5173

# Check MongoDB is running
mongosh --eval "db.adminCommand({ping: 1})"

# Restart servers
npm start  # In booking-backend
npm run dev  # In booking-frontend
```

### Database Issues

**Issue:** Tests fail due to missing data

**Solution:**

```bash
# Re-seed database
cd booking-backend
node scripts/seedTestData.js

# Or clean and seed
mongosh booking-test --eval "db.dropDatabase()"
node scripts/seedTestData.js
```

### Stripe Test Mode Issues

**Issue:** Payment tests fail

**Solution:**

1. Verify Stripe test keys in `.env.test`
2. Use test card: `4242 4242 4242 4242`
3. Check Stripe Dashboard for test mode toggle

### Timeout Errors

**Issue:** Tests timeout waiting for elements

**Solution:**

```javascript
// Increase timeout for specific commands
cy.get('[data-testid="element"]', { timeout: 10000 });

// Or configure globally in cypress.config.js
defaultCommandTimeout: 10000;
```

### Video/Screenshot Issues

**Issue:** Can't find test artifacts

**Location:**

- Videos: `cypress/videos/`
- Screenshots: `cypress/screenshots/`
- Reports: `cypress/reports/`

```bash
# View in CI
# Go to GitHub Actions → Workflow run → Artifacts
```

### Flaky Tests

**Issue:** Tests pass/fail intermittently

**Solutions:**

1. Add explicit waits:

   ```javascript
   cy.wait("@apiCall");
   cy.get('[data-testid="element"]').should("be.visible");
   ```

2. Use test retry (already configured):

   ```javascript
   // In cypress.config.js
   retries: { runMode: 2, openMode: 0 }
   ```

3. Verify test isolation:
   ```javascript
   beforeEach(() => {
     cy.clearLocalStorage();
     cy.clearCookies();
   });
   ```

## 📚 Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Keep tests independent** - no test should depend on another
3. **Clean up after tests** - reset state in `afterEach`
4. **Use fixtures** for consistent test data
5. **Mock external services** when appropriate
6. **Write descriptive test names** - describe what's being tested
7. **Group related tests** in describe blocks
8. **Verify API responses** - don't just test UI

## 📊 Test Reports

View test results:

**Local:**

```bash
# Open Cypress UI to see results
npm run test:e2e:open
```

**CI:**

- Check GitHub Actions workflow runs
- Download artifacts (videos, screenshots, reports)
- View summary in workflow logs

## 🤝 Contributing

When adding new features:

1. Write E2E tests covering the feature
2. Add custom commands if needed
3. Update fixtures with new test data
4. Update this README with new test coverage
5. Ensure tests pass in CI

## 📞 Support

For issues or questions:

- Check [Troubleshooting](#troubleshooting) section
- Review Cypress documentation: https://docs.cypress.io
- Check test videos/screenshots for failure details

---

**Happy Testing! 🧪✅**
