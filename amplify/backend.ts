import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { getSubscriptionStatus } from "./functions/getSubscriptionStatus/resource";
import { createBillingPortalSession } from "./functions/createBillingPortalSession/resource";

defineBackend({
  auth,
  data,
  getSubscriptionStatus,
  createBillingPortalSession,
});
