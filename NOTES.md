# NOTES.md - Technical Documentation

## Key Design Decisions

### 1. Page Object Model (POM) Architecture

**Decision**: Implemented a strict Page Object Model with inheritance hierarchy.

**Rationale**:

- **Maintainability**: Changes to UI elements require updates in only one place
- **Reusability**: Page methods can be reused across multiple tests
- **Readability**: Tests read like user stories rather than technical implementations
- **Separation of Concerns**: Test logic separated from page interaction logic

### 2. Shared Test Data via JSON File

**Decision**: Store registered user credentials in `testData.json` for reuse across tests.

**Rationale**:

- **Efficiency**: Avoid creating new users for every test that requires authentication
- **Speed**: Login tests execute faster by using pre-existing accounts
- **Consistency**: Same test data ensures predictable test behavior

### 3. Environment Variables for Sensitive Data

**Decision**: Store password in `.env` file accessed via `process.env.PASSWORD`.

**Rationale**:

- **Security**: Passwords not hardcoded in repository
- **Flexibility**: Different passwords for different environments
- **CI/CD Ready**: Easy integration with secrets management

### 4. Locator Strategy - CSS Selectors with Strict Mode

**Decision**: Primarily use CSS selectors with `.first()` or scoped locators to handle strict mode violations.

**Rationale**:

- **Stability**: CSS selectors are more stable than XPath in modern web apps
- **Performance**: CSS selectors are faster than XPath
- **Strict Mode**: Enforces unique element matching, catching bugs early

### 5. Asynchronous Operation Handling

**Decision**: Explicit waits after navigation and state-changing operations.

**Rationale**:

- **Reliability**: Ensures page is fully loaded before interactions
- **Async Operations**: Web shop uses AJAX for cart updates
- **Flakiness Reduction**: Prevents race conditions

### 6. Test Organization by Feature Domain

**Decision**: Organize tests into user/, product/, and cart/ directories.

**Rationale**:

- **Clarity**: Easy to locate tests by feature
- **Scalability**: New features get their own test file
- **Parallel Execution**: Tests can run in parallel by domain
- **Domain Expertise**: Team members can focus on specific areas

### 7. Verification Methods in Page Objects

**Decision**: Include both action methods and verification methods in page objects.

**Rationale**:

- **Reusability**: Common verifications (e.g., `verifyLoggedIn()`) used across tests
- **Abstraction**: Test doesn't need to know implementation details
- **Consistency**: Same verification logic everywhere

### 8. Cart State Management

**Decision**: Add `beforeEach` cleanup in Cart Totals tests to clear cart state.

**Rationale**:

- **Test Isolation**: Each test starts with clean cart
- **Predictability**: Known initial state prevents test interdependence
- **Accuracy**: Ensures totals calculations are tested correctly

## Assumptions

### 1. Application Behavior

- **Single-user environment**: Tests assume no concurrent users modifying shared data
- **Stable product catalog**: Product names, prices, and availability remain consistent
- **No rate limiting**: Application doesn't throttle requests during test execution
- **Deterministic behavior**: Same input always produces same output

### 2. Test Environment

- **Network stability**: Reliable internet connection for accessing demo shop
- **Browser availability**: Chromium, Firefox, and WebKit installed
- **No authentication**: Demo shop doesn't require authentication for browsing
- **Public accessibility**: Demo shop is publicly accessible without VPN/firewall restrictions

### 3. Test Data

- **Email uniqueness**: Email addresses must be unique for registration
- **Password complexity**: Demo shop enforces minimum 6-character password
- **No data retention**: Registered users may be periodically cleaned up
- **Test isolation**: Each test can run independently

### 4. Technical Environment

- **Node.js version**: Compatible with Node.js 16+
- **TypeScript support**: Project uses TypeScript strict mode
- **Environment variables**: `.env` file present with required variables
- **File system access**: Tests can read/write `testData.json`

## Known Limitations

### 1. Test Data Dependencies

**Issue**: Some tests depend on shared `testData.json` file.

**Impact**: If file is corrupted or deleted, dependent tests fail.

**Mitigation**: Tests create new data if file doesn't exist; consider using dynamic test data generation in future.

### 2. Category Navigation

**Issue**: Some categories (e.g., Books) have products directly, others (e.g., Computers) require subcategory navigation.

**Impact**: Tests must know category structure in advance.

**Current Solution**: Tests updated to handle both patterns; some tests skip subcategory navigation.

**Future Enhancement**: Auto-detect category type and navigate accordingly.

### 3. Search Result Ordering

**Issue**: Product search results may have non-deterministic ordering without explicit sorting.

**Impact**: Tests using `clickProductByIndex(0)` may select different products.

**Current Solution**: Tests explicitly set sort order or use product titles.

**Risk**: Index-based selection still used in some tests for simplicity.

### 4. Coupon/Gift Card Validation

**Issue**: Do not have access to valid coupons and gifts.

**Impact**: Tests can only verify error messages, not successful application.

**Current Solution**: Tests verify error messages appear correctly.

**Limitation**: Cannot test discount calculation logic.

### 5. Checkout Flow Incomplete

**Issue**: Tests don't complete full checkout process (payment, confirmation).

**Impact**: End-to-end checkout flow not fully tested.

**Rationale**: Demo shop may not support full checkout; focus on cart operations.

**Future Work**: Extend to test entire purchase flow if supported.

### 6. Flakiness in Dynamic Content

**Issue**: Some tests may be flaky due to async operations and dynamic content.

**Impact**: Occasional test failures require reruns.

**Ongoing**: Monitor test stability and add waits as needed.

### 7. Cross-Browser Differences

**Issue**: Some locators or behaviors may differ across browsers.

**Impact**: Tests may pass in Chromium but fail in Firefox/WebKit.

**Current Solution**: Tests primarily developed/tested in Chromium.

**Recommendation**: Run full suite across all browsers before releases.

### 8. Mobile Responsiveness

**Issue**: Tests don't cover mobile viewports or responsive layouts.

**Impact**: Mobile-specific bugs not caught.

**Limitation**: Tests assume desktop viewport (1280x720).

**Future Enhancement**: Add mobile viewport tests in separate suite.

## One Thing Consciously Not Implemented

### **Full Visual Regression Testing**

**What**: Automated screenshot comparison and visual diff detection across test runs.

**Why Not Implemented**:

1. **Scope Consideration**: The demo shop is not under our control, and its UI may change without notice. Visual regression tests would create numerous false positives when the demo site updates its design.

2. **Maintenance Burden**: Visual tests are notoriously brittle and require constant baseline updates. For a demo site, this overhead outweighs the benefits.

3. **Functional Coverage Priority**: Given time constraints, functional testing (user flows, cart operations, search) provides more value than pixel-perfect visual verification.

4. **Dynamic Content**: The demo shop has dynamic elements (product reviews, featured products) that change frequently, making visual comparison unreliable.

5. **Tool Complexity**: While Playwright supports visual comparisons, setting up proper thresholds, handling anti-aliasing differences across browsers, and managing baseline images adds significant complexity.

6. **Alternative Approach**: Instead, tests verify structural elements are present (`toBeVisible()`) and contain expected text/attributes, which catches most UI regressions without the brittleness of pixel comparison.

**When It Would Be Valuable**:

- **Production application**: Where we control the UI and can coordinate changes
- **Critical user flows**: Where exact visual appearance is part of requirements
- **Design system**: Where component consistency must be enforced
- **Stable environment**: Where UI changes are infrequent and controlled

**Current Approach**:
Tests verify:

- Element presence and visibility
- Text content and attributes
- Layout structure (parent-child relationships)
- Interactive elements (buttons, links, forms)
- State changes (cart updates, login/logout)

This functional approach provides strong coverage without the maintenance overhead of visual regression testing.

## Future Enhancements

1. **Test Data Generator Utility**: Create unique test data on-the-fly for parallel execution
2. **API Integration**: Use API calls for test setup (create users, add products) instead of UI
3. **Performance Metrics**: Track page load times and operation durations
4. **Accessibility Testing**: Add automated accessibility checks (ARIA labels, keyboard navigation)
5. **Test Reporting**: Enhanced reports with business-friendly summaries
6. **Parallel Test Optimization**: Group tests by dependencies for optimal parallel execution
7. **Contract Testing**: Verify API contracts if backend APIs are exposed
8. **Monitoring Integration**: Send test results to monitoring dashboard for trends

## Conclusion

This test suite balances comprehensiveness with maintainability. Design decisions prioritize:

- **Reliability**: Stable tests that rarely produce false negatives
- **Maintainability**: Easy to update when application changes
- **Clarity**: Tests serve as living documentation
- **Efficiency**: Fast execution with parallel support

The architecture supports future growth while maintaining current test stability and team productivity.

## Authors

- [@witeknatalia](https://www.github.com/witeknatalia)
