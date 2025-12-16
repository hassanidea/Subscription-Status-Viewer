# Subscription Status Viewer

A full-stack application for viewing and managing Stripe subscriptions, built with AWS Amplify Gen 2, React, and TypeScript.

## Quick Start (5 minutes)

**Prerequisites:** Node.js 18+, AWS CLI configured, Stripe test account

```bash
# 1. Install dependencies
npm install

# 2. Set Stripe API key (required)
npx ampx sandbox secret set STRIPE_API_KEY
# Paste your Stripe test key (sk_test_...) when prompted

# 3. (Optional) Set up Amplitude analytics
echo "VITE_AMPLITUDE_API_KEY=your_amplitude_api_key" > .env.local

# 4. Start backend (in terminal 1)
npx ampx sandbox

# 5. Start frontend (in terminal 2)
npm run dev

# 6. Open http://localhost:5173, sign up, and test!
```

**Testing the full flow:**
1. Sign up with any email/password (no verification needed)
2. Click "Create Stripe Account"
3. Copy the customer ID from browser console (`cus_...`)
4. In Stripe Dashboard: create a subscription for that customer
5. Refresh the app to see subscription status

> **Note:** For simpler testing with a hardcoded Stripe customer ID (no DynamoDB mapping), checkout the `required-only` branch: `git checkout required-only`

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ | Email/password via AWS Cognito |
| Subscription Display | ✅ | Status, plan name, renewal dates |
| Billing Portal | ✅ | One-click Stripe portal access |
| User-Stripe Mapping | ✅ | DynamoDB persistence (stretch goal) |
| Analytics | ✅ | Amplitude event tracking (stretch goal) |

---

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React     │─────▶│  AWS AppSync     │─────▶│   Stripe    │
│   Frontend  │      │  (GraphQL)       │      │     API     │
└─────────────┘      └──────────────────┘      └─────────────┘
                             │
                     ┌───────┴───────┐
                     ▼               ▼
              ┌──────────┐    ┌──────────┐
              │ Lambda   │    │ DynamoDB │
              │ Functions│    │ Mapping  │
              └──────────┘    └──────────┘
```

**Key Design Decisions:**

1. **Lambda for Stripe calls** - Stripe API keys are stored as server-side secrets (via `ampx sandbox secret`), never exposed to the browser. Each Lambda function has a single responsibility: one for fetching subscriptions, one for billing portal, one for customer creation.

2. **DynamoDB user mapping** - Instead of hardcoding a single Stripe customer ID, each authenticated user gets their own Stripe customer. The `UserStripeMapping` table stores `userId → stripeCustomerId` mappings, enabling multi-user support and isolated subscription data.

3. **GraphQL custom queries** - Amplify Gen 2's type-safe schema defines custom queries backed by Lambda resolvers. This provides end-to-end TypeScript types from the schema definition through to the React client, catching errors at compile time.

4. **Single-page app** - Given the assessment scope (one primary feature), a single-page architecture avoids routing complexity. For production, I'd add react-router for dashboard, billing history, and settings pages.

5. **No email verification** - A pre-signup Lambda trigger auto-confirms users to streamline the demo experience. In production, this would be removed to require email verification.

---

## Project Structure

```
amplify/
├── auth/resource.ts              # Cognito config (no email verification)
├── data/resource.ts              # GraphQL schema + queries
├── functions/
│   ├── getSubscriptionStatus/    # Fetch subscription from Stripe
│   ├── createBillingPortalSession/  # Generate Stripe portal URL
│   └── createStripeCustomer/     # Create new Stripe customer
└── backend.ts                    # Backend definition

src/
├── App.tsx                       # Main UI component
├── main.tsx                      # Entry point + Amplify config
└── utils/analytics.ts            # Amplitude wrapper
```

---

## API Reference

### `getSubscriptionStatus(stripeCustomerId)`
Returns subscription details from Stripe.

```typescript
// Response
{
  data: {
    status: "active" | "trialing" | "past_due" | "canceled" | "no_subscription"
    planName: string
    renewalDate: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
  }
  error?: string
}
```

### `createBillingPortalSession(stripeCustomerId, returnUrl)`
Creates Stripe Billing Portal session URL.

### `createStripeCustomer(email, userId)`
Creates new Stripe customer and returns `customerId`.

---

## Environment Variables

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `STRIPE_API_KEY` | Yes | Amplify secrets | Stripe test key (`sk_test_...`) |
| `VITE_AMPLITUDE_API_KEY` | No | `.env.local` | Amplitude API key |

---

## Assumptions

1. **Test mode** - Using Stripe test keys
2. **Dynamic mapping** - Each user creates their own Stripe customer on first visit
3. **Stripe Subsciption** - Subscription will be added to a Stripe customer in the Stripe dashboard itself not in the app
4. **US locale** - Date formatting uses US English
5. **Modern browsers** - Targets ES6+ compatible browsers

---

## What I'd Improve with More Time

- [ ] **UI** - Create Header, Subscription and Footer React components for better reusability, readability and scalability
- [ ] **Stripe webhooks** - Real-time subscription updates instead of manual refresh
- [ ] **Tests** - Unit tests for Lambdas (Jest), E2E for critical flows (Playwright)
- [ ] **Performance** - Reduce API requests
- [ ] **Error monitoring** - Sentry or CloudWatch for production visibility
- [ ] **CI/CD** - GitHub Actions for automated testing and deployment

---

## Stretch Goals Completed

### 1. User → Stripe Customer Mapping
- DynamoDB `UserStripeMapping` table
- Automatically creates Stripe customer on first visit
- Maps Cognito `userId` to Stripe `customerId`

### 2. Amplitude Analytics
Events tracked:
- `subscription_page_viewed` - On page load
- `manage_billing_clicked` - When clicking billing button
- `stripe_account_created` - When creating new customer

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** AWS Amplify Gen 2, Lambda, AppSync
- **Database:** DynamoDB
- **Auth:** AWS Cognito
- **Payments:** Stripe API
- **Analytics:** Amplitude

---

Built for CPOS assessment.
