# E2E E-Commerce Test Suite

Comprehensive end-to-end test automation suite for the Tricentis Demo Web Shop using Playwright and TypeScript.

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd e2e-ecommerce
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright browsers**:

   ```bash
   npx playwright install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the project root:

   ```bash
   PASSWORD=your_password_here
   ```

   This password will be used for user registration and login tests.

## Running Tests

### Run all tests:

```bash
npm run tests
```

### Run specific test suites:

```bash
# User registration tests
npx playwright test tests/user/createAccount.spec.ts

# Login tests
npx playwright test tests/user/login.spec.ts

# Product search tests
npx playwright test tests/product/search.spec.ts

# Product browsing tests
npx playwright test tests/product/productDetails.spec.ts

# Shopping cart tests
npx playwright test tests/cart/cart.spec.ts
```

### Run tests with UI mode (recommended for development):

```bash
npm run tests-ui
```
