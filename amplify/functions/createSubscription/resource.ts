import { defineFunction, secret } from "@aws-amplify/backend";

export const createSubscription = defineFunction({
  name: "createSubscription",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    STRIPE_API_KEY: secret("STRIPE_API_KEY"),
  },
});
