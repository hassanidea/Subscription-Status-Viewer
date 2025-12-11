import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

// Remove the custom interface and just use the response type directly

function App() {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await client.queries.getSubscriptionStatus({
          userId: user?.userId || "test-user",
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

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Subscription Status</h1>
        <div>
          <span style={{ marginRight: "15px" }}>
            Welcome, {user?.signInDetails?.loginId}
          </span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading subscription status...</p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#991b1b",
          }}
        >
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : subscriptionData ? (
        <div
          style={{
            padding: "30px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "8px", color: "#374151" }}>Status</h3>
            <span
              style={{
                display: "inline-block",
                padding: "8px 16px",
                backgroundColor: getStatusColor(subscriptionData.status || ""),
                color: "white",
                borderRadius: "6px",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {formatStatus(subscriptionData.status || "unknown")}
            </span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "8px", color: "#374151" }}>Plan</h3>
            <p style={{ fontSize: "18px", fontWeight: "500" }}>
              {subscriptionData.planName || "N/A"}
            </p>
          </div>

          {subscriptionData.renewalDate && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "8px", color: "#374151" }}>
                Renewal Date
              </h3>
              <p style={{ fontSize: "18px", fontWeight: "500" }}>
                {formatDate(subscriptionData.renewalDate)}
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#6b7280" }}>
              Current Period
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Start
                </p>
                <p style={{ fontWeight: "500" }}>
                  {formatDate(subscriptionData.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  End
                </p>
                <p style={{ fontWeight: "500" }}>
                  {formatDate(subscriptionData.currentPeriodEnd)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No subscription data available</p>
      )}
    </main>
  );
}

export default App;
