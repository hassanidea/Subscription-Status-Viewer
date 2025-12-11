import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const handler = async (event: {
  arguments: { email: string; userId: string };
}) => {
  try {
    const { email, userId } = event.arguments;

    const customer = await stripe.customers.create({
      email,
      metadata: { cognitoUserId: userId },
    });

    console.log("Created Stripe customer:", customer.id);

    return {
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create customer",
    };
  }
};
