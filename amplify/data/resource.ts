import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getSubscriptionStatus } from "../functions/getSubscriptionStatus/resource";
import { createBillingPortalSession } from "../functions/createBillingPortalSession/resource";

const schema = a.schema({
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
