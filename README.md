# Playwright TypeScript

Automation Testing Framework using TypeScript + Playwright

---

# Install Node.js

Download and install Node.js

https://nodejs.org

Verify installation:

```bash
node -v
npm -v
```

---

# Create Playwright Project

```bash
npm init playwright@latest
```

Select:

* TypeScript
* Playwright Test
* Install browsers = Yes

---

# Install Browsers

Install all browsers

```bash
npx playwright install
```

Install Chromium only

```bash
npx playwright install chromium
```

---

# Install Dependencies

```bash
npm install
```

---

# Install dotenv

```bash
npm install dotenv
```

---

# Install Type Definitions

```bash
npm install --save-dev @types/node
```

---

# Project Structure

```txt
project/
├── tests/
│   ├── auth/
│   │   └── auth.setup.ts
│   └── ui/
│       └── example.spec.ts
│
├── pages/
│   └── pantip.login.page.ts
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env
└── auth.json
```

---

# Environment Variables

Create `.env`

```env
BASE_URL=https://stg.pantip.com

LOGIN_USER=your_user
LOGIN_PASS=your_password

AUTH_USER=your_basic_auth_user
AUTH_PASS=your_basic_auth_pass
```

---

# .gitignore

```gitignore
node_modules
playwright-report
test-results
auth.json
.env
```

---

# Run All Tests

```bash
npx playwright test
```

---

# Debug Mode

```bash
npx playwright test --debug
```

---

# Run Chromium Only

```bash
npx playwright test --project=chromium
```

---

# Run Specific File

```bash
npx playwright test tests/ui/example.spec.ts
```

---

# Run Specific Test Name

```bash
npx playwright test -g "login"
```

---

# Headed Mode

```bash
npx playwright test --headed
```

---

# Slow Motion

```bash
npx playwright test --headed --slow-mo=1000
```

---

# Open HTML Report

```bash
npx playwright show-report
```

---

# Open Trace Viewer

```bash
npx playwright show-trace trace.zip
```

---

# Generate Locator / Test

```bash
npx playwright codegen
```

Open specific website:

```bash
npx playwright codegen https://stg.pantip.com
```

---

# UI Mode

```bash
npx playwright test --ui
```

---

# Generate Auth Session

Run auth setup

```bash
npx playwright test tests/auth/auth.setup.ts
```

---

# Run With Workers

```bash
npx playwright test --workers=1
```

---

# Retry Failed Tests

```bash
npx playwright test --retries=2
```

---

# Update Snapshots

```bash
npx playwright test --update-snapshots
```

---

# Useful Commands

Clear Playwright cache

```bash
npx playwright install --force
```

Check Playwright version

```bash
npx playwright --version
```

---

# VS Code Extensions

Recommended:

* Playwright Test for VSCode
* ESLint
* Prettier

---

# Recommended Settings

## playwright.config.ts

```ts
use: {
  baseURL: process.env.BASE_URL,
  trace: 'on-first-retry',
  ignoreHTTPSErrors: true,
}
```

---

# Best Practices

* Use Page Object Model (POM)
* Use `.env`
* Use `storageState`
* Avoid hardcode credentials
* Use `getByRole()` whenever possible
* Use `expect()` instead of manual waits
* Avoid `waitForTimeout()`

---

# Common Commands

| Command                     | Description       |
| --------------------------- | ----------------- |
| npx playwright test         | Run all tests     |
| npx playwright test --debug | Debug mode        |
| npx playwright show-report  | Open HTML report  |
| npx playwright codegen      | Generate locators |
| npx playwright test --ui    | UI mode           |
| npx playwright install      | Install browsers  |

---

# Official Documentation

Playwright

https://playwright.dev
