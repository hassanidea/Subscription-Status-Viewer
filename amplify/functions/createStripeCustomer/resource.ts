import { defineFunction, secret } from "@aws-amplify/backend";

export const createStripeCustomer = defineFunction({
  name: "createStripeCustomer",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    STRIPE_API_KEY: secret("STRIPE_API_KEY"),
  },
});
