import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const handler = async (event: {
  arguments: { stripeCustomerId: string; returnUrl: string };
}) => {
  try {
    const { stripeCustomerId, returnUrl } = event.arguments;

    if (!stripeCustomerId) {
      return {
        url: null,
        error: "No Stripe customer found for user",
      };
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
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
