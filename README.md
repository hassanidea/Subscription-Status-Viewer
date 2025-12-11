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

### 2. **Hardcoded Test Customer ID**
- **Why**: Assessment scope focused on functionality demonstration
- **Production Alternative**: Would use DynamoDB table mapping `userId` → `stripe_customer_id`
- **Current Implementation**: `TEST_CUSTOMER_ID` constant in Lambda functions

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

## Assumptions

1. **Test Environment**: Using Stripe test mode with test API keys
2. **Single Customer**: One test customer (`cus_TaB0dKtvFSXyYe`) for demonstration
3. **US Locale**: Date formatting assumes US English locale
4. **Modern Browsers**: Targets evergreen browsers with ES6+ support
5. **AWS Account**: User has AWS account with appropriate permissions
6. **Stripe Account**: User has Stripe account in test mode

## Setup Instructions

See [SETUP.md](./SETUP.md) for detailed local setup instructions.

**Quick Start:**
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Stripe API key

# 3. Start Amplify sandbox
npx ampx sandbox

# 4. In a new terminal, start dev server
npm run dev
```

## What Would Be Improved with More Time

### Security & Production Readiness
- [ ] **Database Integration**: DynamoDB table for `userId` → `stripe_customer_id` mapping
- [ ] **AWS Secrets Manager**: Store Stripe API keys in Secrets Manager instead of environment variables
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
├── README.md                     # This file
└── SETUP.md                      # Setup instructions
```

## Environment Variables

Required environment variables (see `.env.example`):

```bash
STRIPE_API_KEY=sk_test_...        # Your Stripe secret key (test mode)
TEST_STRIPE_CUSTOMER_ID=cus_...   # Test customer ID for demonstration
```

## API Reference

### `getSubscriptionStatus`

Fetches subscription details from Stripe API.

**Arguments:**
- `userId: string` - User ID (currently mapped to test customer)

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
- `userId: string` - User ID
- `returnUrl: string` - URL to redirect after portal interaction

**Returns:**
```typescript
{
  url: string | null    // Stripe portal URL
  error?: string
}
```

## License

This project is created for assessment purposes.

## Author

Built with AWS Amplify Gen 2, React, and Stripe.
