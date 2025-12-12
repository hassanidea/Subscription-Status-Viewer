import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { setAnalyticsUserId, trackEvent } from "./utils/analytics";

const client = generateClient<Schema>();

function App() {
  // Using any for flexibility with Amplify's generated GraphQL types
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      // Set analytics user ID
      if (user?.userId) {
        setAnalyticsUserId(user.userId);
      }
      try {
        setIsLoading(true);
        setError(null);

        // Look up the user's Stripe customer ID from DynamoDB
        const mappingResponse = await client.models.UserStripeMapping.list({
          filter: { owner: { eq: user?.userId } },
        });

        const mapping = mappingResponse.data?.[0];

        if (!mapping?.stripeCustomerId) {
          // No Stripe customer exists yet
          setSubscriptionData({ status: "no_customer" });
          return;
        }

        // Fetch subscription status using the Stripe customer ID
        const response = await client.queries.getSubscriptionStatus({
          stripeCustomerId: mapping.stripeCustomerId,
        });

        if (response.data?.error) {
          setError(response.data.error);
          setSubscriptionData(null);
        } else if (response.data?.data) {
          setSubscriptionData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch subscription"
        );
      } finally {
        setIsLoading(false);
        trackEvent("subscription_page_viewed", {
          hasSubscription: !!subscriptionData,
        });
      }
    }

    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "trialing":
        return "#3b82f6";
      case "past_due":
        return "#f59e0b";
      case "canceled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const handleManageBilling = async () => {
    trackEvent("manage_billing_clicked");
    try {
      setIsActionLoading(true);
      const returnUrl = window.location.href;

      // Look up the user's Stripe customer ID
      const mappingResponse = await client.models.UserStripeMapping.list({
        filter: { owner: { eq: user?.userId } },
      });

      const mapping = mappingResponse.data?.[0];
      if (!mapping?.stripeCustomerId) {
        setError("No Stripe customer found");
        return;
      }

      const response = await client.queries.createBillingPortalSession({
        stripeCustomerId: mapping.stripeCustomerId,
        returnUrl,
      });

      if (response.data?.error) {
        setError(response.data.error);
      } else if (response.data?.url) {
        // Redirect to Stripe Billing Portal
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error("Error opening billing portal:", err);
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsActionLoading(true);
      const userId = user?.userId || "";
      const email = user?.signInDetails?.loginId || "";

      // Create Stripe customer
      const response = await client.queries.createStripeCustomer({
        email,
        userId,
      });

      if (response.data?.error) {
        setError(response.data.error);
        return;
      }

      if (response.data?.customerId) {
        // Save mapping to DynamoDB
        await client.models.UserStripeMapping.create({
          owner: userId,
          stripeCustomerId: response.data.customerId,
          email,
        });

        console.log(
          "Stripe customer created and saved:",
          response.data.customerId
        );

        trackEvent("stripe_account_created", {
          customerId: response.data.customerId,
        });

        // Fetch subscription status with the new customer ID
        const statusResponse = await client.queries.getSubscriptionStatus({
          stripeCustomerId: response.data.customerId,
        });

        if (statusResponse.data?.data) {
          setSubscriptionData(statusResponse.data.data);
        }
      }
    } catch (err) {
      console.error("Error creating Stripe customer:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create Stripe customer"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <main
      style={{
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "40px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            margin: "0 0 8px 0",
            color: "#111827",
          }}
        >
          Subscription Status
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          <span>{user?.signInDetails?.loginId}</span>
          <button
            onClick={signOut}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              color: "#6b7280",
              backgroundColor: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#6b7280",
          }}
        >
          <p>Loading...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px" }}>{error}</p>
        </div>
      ) : subscriptionData ? (
        /* Subscription Data */
        <div
          style={{
            padding: "32px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {subscriptionData?.status === "no_customer" ? (
            /* NO STRIPE CUSTOMER - Show create account button */
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0 0 8px 0",
                }}
              >
                Get Started
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 24px 0",
                }}
              >
                Create your account to manage subscriptions
              </p>
              <button
                onClick={handleSubscribe}
                disabled={isActionLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: isActionLoading ? "#e5e7eb" : "#635BFF",
                  color: isActionLoading ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                }}
              >
                {isActionLoading ? "Creating..." : "Create Stripe Account"}
              </button>
            </div>
          ) : subscriptionData?.status === "no_subscription" ? (
            /* HAS CUSTOMER BUT NO SUBSCRIPTION */
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0 0 8px 0",
                }}
              >
                No Active Subscription
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 24px 0",
                }}
              >
                Your Stripe account is ready
              </p>
              <button
                onClick={handleManageBilling}
                disabled={isActionLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: isActionLoading ? "#e5e7eb" : "#111827",
                  color: isActionLoading ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                }}
              >
                {isActionLoading ? "Loading..." : "Manage Billing"}
              </button>
            </div>
          ) : (
            /* HAS SUBSCRIPTION - Show subscription details */
            <>
              {/* Status Badge */}
              <div style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#6b7280",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Status
                </label>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: getStatusColor(
                      subscriptionData.status || ""
                    ),
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    textTransform: "capitalize",
                  }}
                >
                  {formatStatus(subscriptionData.status || "unknown")}
                </span>
              </div>

              {/* Plan Name */}
              <div style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#6b7280",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Plan
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "#111827",
                  }}
                >
                  {subscriptionData.planName || "N/A"}
                </p>
              </div>

              {/* Renewal Date */}
              {subscriptionData.renewalDate && (
                <div style={{ marginBottom: "32px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Next Renewal
                  </label>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      color: "#111827",
                    }}
                  >
                    {formatDate(subscriptionData.renewalDate)}
                  </p>
                </div>
              )}

              {/* Current Period */}
              <div
                style={{
                  marginBottom: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#6b7280",
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Current Period
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      Start
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#111827",
                      }}
                    >
                      {formatDate(subscriptionData.currentPeriodStart)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      End
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#111827",
                      }}
                    >
                      {formatDate(subscriptionData.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manage Billing Button */}
              <button
                onClick={handleManageBilling}
                disabled={isActionLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: isActionLoading ? "#e5e7eb" : "#111827",
                  color: isActionLoading ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActionLoading) {
                    e.currentTarget.style.backgroundColor = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActionLoading) {
                    e.currentTarget.style.backgroundColor = "#111827";
                  }
                }}
              >
                {isActionLoading ? "Loading..." : "Manage Billing"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#9ca3af",
          }}
        >
          <p>No subscription found</p>
        </div>
      )}
    </main>
  );
}

export default App;
