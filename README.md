# Subscription Status Viewer

A full-stack application for viewing and managing Stripe subscriptions, built with AWS Amplify Gen 2, React, and TypeScript.

## Quick Start (5 minutes)

**Prerequisites:** Node.js 18+, AWS CLI configured, Stripe test account

```bash
# 1. Install dependencies
npm install

# 2. Set Stripe API key
npx ampx sandbox secret set STRIPE_API_KEY
# Paste your Stripe test key (sk_test_...) when prompted

# 3. Start backend (in terminal 1)
npx ampx sandbox

# 4. Start frontend (in terminal 2)
npm run dev

# 5. Open http://localhost:5173, sign up, and test!
```

**Testing the full flow:**
1. Sign up with any email/password (no verification needed)
2. Click "Create Stripe Account"
3. Copy the customer ID from browser console (`cus_...`)
4. In Stripe Dashboard: create a subscription for that customer
5. Refresh the app to see subscription status

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

1. **Lambda for Stripe calls** - Keeps API keys secure on backend
2. **DynamoDB user mapping** - Each user gets their own Stripe customer
3. **GraphQL custom queries** - Type-safe API with Amplify Gen 2
4. **Single-page app** - Simple architecture for assessment scope

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
3. **US locale** - Date formatting uses US English
4. **Modern browsers** - Targets ES6+ compatible browsers

---

## What I'd Improve with More Time

**High Priority:**
- [ ] Stripe webhooks for real-time status updates
- [ ] Unit tests for Lambda functions
- [ ] E2E tests with Playwright

**Medium Priority:**
- [ ] Billing history/invoice downloads
- [ ] Better error handling with toast notifications
- [ ] Mobile-responsive design improvements

**Lower Priority:**
- [ ] CI/CD pipeline with GitHub Actions
- [ ] AWS Secrets Manager for production
- [ ] Dark mode support

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
