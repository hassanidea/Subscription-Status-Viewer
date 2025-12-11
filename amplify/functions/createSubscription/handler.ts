import type { Schema } from "../../data/resource";
import Stripe from "stripe";

type CreateSubscriptionHandler =
  Schema["createSubscription"]["functionHandler"];

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

// Your price ID for the Pro Plan
const DEFAULT_PRICE_ID = "price_1SbQUQ5yRh6RLxeePqBl6GNg";

export const handler: CreateSubscriptionHandler = async (event) => {
  try {
    const { userId, priceId, returnUrl } = event.arguments;
    const selectedPriceId = priceId || DEFAULT_PRICE_ID;

    // Using test customer ID (same as getSubscriptionStatus)
    // TODO: Later we'll query UserStripeMapping table to get customer ID by userId
    const customerId = "cus_TaAXUYZvkhOKJO";

    if (!customerId) {
      return {
        checkoutUrl: null,
        error: "No Stripe customer found for user",
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
    });

    console.log("Created checkout session:", session.id);

    return {
      checkoutUrl: session.url,
      error: null,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      checkoutUrl: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    };
  }
};
