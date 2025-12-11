# Subscription Status Viewer

A modern web application for viewing and managing Stripe subscription status, built with AWS Amplify Gen 2, React, TypeScript, and Vite.

## Features

✅ **Subscription Status Display**
- View current subscription status (active, trialing, past_due, canceled)
- Display plan name and pricing information
- Show renewal dates and current billing period

✅ **Stripe Billing Portal Integration**
- One-click access to Stripe's hosted billing portal
- Manage payment methods, invoices, and subscriptions
- Seamless redirect flow with return URL handling

✅ **Authentication**
- Secure user authentication with AWS Cognito
- Protected routes and API endpoints
- Email/password authentication flow

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: AWS Amplify Gen 2
- **Authentication**: AWS Cognito
- **API**: AWS AppSync (GraphQL)
- **Functions**: AWS Lambda (Node.js)
- **Payments**: Stripe API
- **Hosting**: AWS Amplify Hosting (optional)

## Architecture

### High-Level Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React     │─────▶│  AWS Amplify     │─────▶│   Stripe    │
│   Frontend  │      │  GraphQL API     │      │     API     │
└─────────────┘      └──────────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────────┐
                     │  Lambda Functions│
                     │  - Subscription  │
                     │  - Billing Portal│
                     └──────────────────┘
```

### Key Components

**Frontend (React)**
- `App.tsx`: Main application component with subscription display and billing management
- Type-safe GraphQL queries using Amplify Gen 2 client
- Responsive, minimalistic UI design

**Backend (Amplify Gen 2)**
- `amplify/data/resource.ts`: GraphQL schema definition with custom queries
- `amplify/functions/getSubscriptionStatus/`: Lambda function to fetch Stripe subscription data
- `amplify/functions/createBillingPortalSession/`: Lambda function to generate Stripe portal URLs
- `amplify/auth/resource.ts`: Cognito user pool configuration

**API Integration**
- GraphQL queries with authenticated access only
- Custom return types for error handling
- Secure secret management for Stripe API keys

## Architecture Decisions

### 1. **AWS Amplify Gen 2**
- **Why**: Modern, type-safe, code-first approach to backend configuration
- **Benefit**: Better developer experience with TypeScript throughout
- **Trade-off**: Requires learning Amplify Gen 2 syntax (different from Gen 1)

### 2. **Dynamic User-to-Stripe Customer Mapping**
- **Implementation**: DynamoDB `UserStripeMapping` table maps `userId` → `stripeCustomerId`
- **Flow**: User creates Stripe account on first visit → mapping saved to DynamoDB → subsequent requests use mapped customer ID
- **Benefit**: Each authenticated user gets their own Stripe customer and subscription data
- **Testing**: When a user creates a Stripe account, the customer ID is logged to the console - use this ID to create a test subscription in the Stripe Dashboard

### 3. **Lambda Functions for Stripe Integration**
- **Why**: Keeps API keys secure on the backend
- **Benefit**: Direct Stripe API calls without exposing credentials
- **Pattern**: Each function has single responsibility (SRP)

### 4. **Inline Styles in React**
- **Why**: Simplicity for assessment scope, no build tool configuration
- **Production Alternative**: Would use CSS modules, Tailwind CSS, or styled-components
- **Benefit**: Self-contained component with no external dependencies

### 5. **GraphQL Custom Queries**
- **Why**: Amplify Gen 2 pattern for Lambda-backed resolvers
- **Benefit**: Type safety from schema to client
- **Pattern**: Custom types with optional `data` and `error` fields

### 6. **Single-Page Application**
- **Why**: Assessment scope has one primary feature (subscription viewing)
- **Benefit**: Simpler architecture, no routing overhead, immediate user experience
- **Trade-off**: Less scalable for multi-feature applications
- **Production Alternative**: Would add react-router for multi-page app with dashboard, settings, billing history, etc.

## Assumptions

1. **Test Environment**: Using Stripe test mode with test API keys
2. **Dynamic Customer Mapping**: Each user creates their own Stripe customer on first visit
   - Customer ID is stored in DynamoDB `UserStripeMapping` table
   - Each authenticated user sees their own subscription data
3. **US Locale**: Date formatting assumes US English locale
4. **Modern Browsers**: Targets evergreen browsers with ES6+ support
5. **AWS Account**: User has AWS account with appropriate permissions
6. **Stripe Account**: User has Stripe account in test mode

## Setup Instructions

**Prerequisites:**
- Node.js 18+ installed
- AWS CLI configured with credentials (`aws configure`)
- Stripe account in test mode

**Quick Start:**
```bash
# 1. Install dependencies
npm install

# 2. Set Stripe API key in Amplify sandbox secrets
npx ampx sandbox secret set STRIPE_API_KEY
# When prompted, paste your Stripe test API key (sk_test_...)

# 3. Start Amplify sandbox (deploys backend with authentication)
npx ampx sandbox

# 4. In a new terminal, start development server
npm run dev

# 5. Sign up with any email/password (no verification code required)
# 6. Click "Create Stripe Account" to create your Stripe customer
# 7. Copy the customer ID from the browser console (cus_...)
# 8. Create a subscription for that customer in Stripe Dashboard
# 9. Refresh the app to see your subscription status
```

## What Would Be Improved with More Time

### Security & Production Readiness
- [x] **Database Integration**: DynamoDB `UserStripeMapping` table for `userId` → `stripeCustomerId` mapping
- [ ] **AWS Secrets Manager**: Migrate from Amplify sandbox secrets to Secrets Manager for production
- [ ] **Error Monitoring**: Integrate CloudWatch Logs and error tracking (Sentry)
- [ ] **Rate Limiting**: Add API Gateway throttling and per-user rate limits
- [ ] **Input Validation**: Add comprehensive validation with Zod or Joi

### Features
- [ ] **Subscription Webhooks**: Listen to Stripe webhooks for real-time updates
- [ ] **Subscription History**: Show payment history and invoice downloads
- [ ] **Plan Upgrades/Downgrades**: Allow users to change subscription plans
- [ ] **Usage Metrics**: Display usage stats if using metered billing
- [ ] **Multiple Subscriptions**: Support users with multiple active subscriptions

### Code Quality
- [ ] **Unit Tests**: Jest tests for React components
- [ ] **Integration Tests**: Lambda function testing with mocked Stripe
- [ ] **E2E Tests**: Playwright or Cypress for full user flows
- [ ] **ESLint/Prettier**: Enforce code style and best practices
- [ ] **TypeScript Strict Mode**: Enable stricter type checking

### UI/UX
- [ ] **CSS Framework**: Migrate to Tailwind CSS or Material-UI
- [ ] **Loading Skeletons**: Better loading states with skeleton screens
- [ ] **Toast Notifications**: User feedback for actions (success/error)
- [ ] **Mobile Optimization**: Improve mobile responsive design
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Dark Mode**: Optional dark theme

### DevOps
- [ ] **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- [ ] **Environment Management**: Separate dev/staging/production environments
- [ ] **Infrastructure as Code**: CDK for complete AWS stack definition
- [ ] **Monitoring Dashboard**: CloudWatch dashboard for key metrics
- [ ] **Cost Optimization**: Lambda reserved concurrency, DynamoDB on-demand pricing

### Documentation
- [ ] **API Documentation**: OpenAPI/GraphQL schema documentation
- [ ] **Component Storybook**: Visual component library
- [ ] **Architecture Diagrams**: Detailed system architecture diagrams
- [ ] **Runbook**: Operational procedures for common issues

## Project Structure

```
.
├── amplify/
│   ├── auth/
│   │   ├── pre-sign-up/
│   │   │   ├── handler.ts        # Auto-confirm users (no email verification)
│   │   │   └── resource.ts       # Pre-signup trigger Lambda config
│   │   └── resource.ts           # Cognito configuration
│   ├── data/
│   │   └── resource.ts           # GraphQL schema
│   ├── functions/
│   │   ├── getSubscriptionStatus/
│   │   │   ├── handler.ts        # Fetch subscription from Stripe
│   │   │   ├── resource.ts       # Lambda configuration
│   │   │   └── package.json      # Stripe SDK dependency
│   │   └── createBillingPortalSession/
│   │       ├── handler.ts        # Create Stripe portal session
│   │       ├── resource.ts       # Lambda configuration
│   │       └── package.json      # Stripe SDK dependency
│   └── backend.ts                # Backend definition
├── src/
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Entry point with Amplify config
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
└── README.md                     # This file
```

## Environment Variables

The application uses **Amplify sandbox secrets** for secure credential management:

**Required Secret:**
- `STRIPE_API_KEY` - Your Stripe test API key (set via `npx ampx sandbox secret set STRIPE_API_KEY`)

## API Reference

### `getSubscriptionStatus`

Fetches subscription details from Stripe API.

**Arguments:**
- `stripeCustomerId: string` - Stripe customer ID from UserStripeMapping table

**Returns:**
```typescript
{
  data: {
    status: "active" | "trialing" | "past_due" | "canceled" | "no_subscription"
    planName: string
    renewalDate: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
  } | null
  error?: string
}
```

### `createBillingPortalSession`

Creates a Stripe Billing Portal session URL.

**Arguments:**
- `stripeCustomerId: string` - Stripe customer ID from UserStripeMapping table
- `returnUrl: string` - URL to redirect after portal interaction

**Returns:**
```typescript
{
  url: string | null    // Stripe portal URL
  error?: string
}
```

### `createStripeCustomer`

Creates a new Stripe customer for the authenticated user.

**Arguments:**
- `email: string` - User's email address
- `userId: string` - Cognito user ID (stored in customer metadata)

**Returns:**
```typescript
{
  customerId: string | null  // New Stripe customer ID (cus_...)
  error?: string
}
```

## License

This project is created for assessment purposes.

## Author

Built with AWS Amplify Gen 2, React, and Stripe.
