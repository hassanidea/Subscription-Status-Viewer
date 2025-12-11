import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getSubscriptionStatus } from "../functions/getSubscriptionStatus/resource";
import { createBillingPortalSession } from "../functions/createBillingPortalSession/resource";
import { createSubscription } from "../functions/createSubscription/resource";

const schema = a.schema({
  createSubscription: a
    .query()
    .arguments({
      userId: a.string().required(),
      priceId: a.string(),
      returnUrl: a.string().required(),
    })
    .returns(
      a.customType({
        checkoutUrl: a.string(),
        error: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createSubscription)),

  // Data model: User-Stripe customer mapping
  UserStripeMapping: a
    .model({
      userId: a.string().required(),
      stripeCustomerId: a.string().required(),
      email: a.email(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  getSubscriptionStatus: a
    .query()
    .arguments({
      userId: a.string().required(),
    })
    .returns(
      a.customType({
        data: a.customType({
          status: a.string(),
          planName: a.string(),
          renewalDate: a.string(),
          currentPeriodEnd: a.string(),
          currentPeriodStart: a.string(),
        }),
        error: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getSubscriptionStatus)),

  createBillingPortalSession: a
    .query()
    .arguments({
      userId: a.string().required(),
      returnUrl: a.string().required(),
    })
    .returns(
      a.customType({
        url: a.string(),
        error: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createBillingPortalSession)),
});

export type Schema = ClientSchema<typeof schema>; // ← KEEP THIS LINE!

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
