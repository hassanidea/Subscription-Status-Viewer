import type { Handler } from "aws-lambda";
import Stripe from "stripe";

export type CreateBillingPortalSessionHandler = Handler<
  { userId: string; returnUrl: string },
  {
    url: string | null;
    error?: string;
  }
>;

// Hardcoded test customer for assessment scope
const TEST_CUSTOMER_ID = "cus_TaB0dKtvFSXyYe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const handler: CreateBillingPortalSessionHandler = async (event) => {
  try {
    const { returnUrl } = event;

    // Use test customer ID (hardcoded for assessment)
    // In production: would query database for stripe_customer_id
    const customerId = TEST_CUSTOMER_ID;

    if (!customerId) {
      return {
        url: null,
        error: "Customer ID not found",
      };
    }

    // Create Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return {
      url: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create billing portal session",
    };
  }
};
