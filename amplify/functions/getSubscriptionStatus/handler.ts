import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const handler = async (event: {
  arguments: { stripeCustomerId: string };
}) => {
  try {
    const { stripeCustomerId } = event.arguments;

    if (!stripeCustomerId) {
      return {
        data: {
          status: "no_subscription",
          planName: "None",
          renewalDate: null,
          currentPeriodEnd: null,
          currentPeriodStart: null,
        },
      };
    }

    // Fetch subscriptions from Stripe API
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 1,
      status: "all",
    });

    // No subscription found
    if (subscriptions.data.length === 0) {
      return {
        data: {
          status: "no_subscription",
          planName: "None",
          renewalDate: null,
          currentPeriodEnd: null,
          currentPeriodStart: null,
        },
      };
    }

    // Get first subscription
    const subscription = subscriptions.data[0] as any;

    // Fetch product details
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);

    // Map Stripe status to our app's status enum
    const mapStatus = (stripeStatus: string) => {
      if (stripeStatus === "active") return "active";
      if (stripeStatus === "trialing") return "trialing";
      if (stripeStatus === "past_due") return "past_due";
      if (stripeStatus === "canceled" || stripeStatus === "unpaid")
        return "canceled";
      return "no_subscription";
    };

    // Return subscription data
    return {
      data: {
        status: mapStatus(subscription.status),
        planName: product.name,
        renewalDate: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
        currentPeriodStart: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch subscription",
    };
  }
};
