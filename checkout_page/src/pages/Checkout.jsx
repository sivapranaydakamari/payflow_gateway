import { useEffect, useState } from "react";
import "../theme.css";

const API_BASE = "http://localhost:8000";

export default function Checkout() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState(null);
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [paymentId, setPaymentId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  
  useEffect(() => {
    if (!orderId) return;

    fetch(`${API_BASE}/api/v1/orders/${orderId}/public`)
      .then((res) => res.json())
      .then(setOrder)
      .catch(() => setError("Unable to load order"));
  }, [orderId]);

  useEffect(() => {
    if (!paymentId) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `${API_BASE}/api/v1/payments/${paymentId}/public`
      );
      const data = await res.json();

      if (data.status === "success") {
        setStatus("success");
        clearInterval(interval);
      }

      if (data.status === "failed") {
        setStatus("failed");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const submitPayment = async (payload) => {
    setStatus("processing");

    const res = await fetch(`${API_BASE}/api/v1/payments/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.id) {
      setPaymentId(data.id);
    } else {
      setStatus("failed");
      setError(data?.error?.description || "Payment failed");
    }
  };

  if (!order) {
    return <div style={{ padding: 40 }}>Loading checkout…</div>;
  }

  return (
    <div
      data-test-id="checkout-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card" style={{ width: 420 }}>
        {/*Order Summary*/}
        <div data-test-id="order-summary" style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 12 }}>Complete Payment</h2>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Amount</span>
            <span data-test-id="order-amount">
              ₹{(order.amount / 100).toFixed(2)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            <span>Order ID</span>
            <span data-test-id="order-id">{order.id}</span>
          </div>
        </div>

        {/*Method Selection*/}
        {status === "idle" && !method && (
          <div data-test-id="payment-methods" style={{ display: "flex", gap: 12 }}>
            <button
              data-test-id="method-upi"
              onClick={() => setMethod("upi")}
            >
              UPI
            </button>

            <button
              data-test-id="method-card"
              onClick={() => setMethod("card")}
            >
              Card
            </button>
          </div>
        )}

        {/*UPI Form*/}
        {method === "upi" && status === "idle" && (
          <form
            data-test-id="upi-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitPayment({
                order_id: order.id,
                method: "upi",
                vpa,
              });
            }}
          >
            <input
              data-test-id="vpa-input"
              placeholder="username@bank"
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <button data-test-id="pay-button">
              Pay ₹{(order.amount / 100).toFixed(2)}
            </button>
          </form>
        )}

        {/*Card Form*/}
        {method === "card" && status === "idle" && (
          <form
            data-test-id="card-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitPayment({
                order_id: order.id,
                method: "card",
                card: {
                  number: card.number,
                  expiry_month: card.expiry.split("/")[0],
                  expiry_year: card.expiry.split("/")[1],
                  cvv: card.cvv,
                  holder_name: card.name,
                },
              });
            }}
          >
            <input
              data-test-id="card-number-input"
              placeholder="Card Number"
              value={card.number}
              onChange={(e) =>
                setCard({ ...card, number: e.target.value })
              }
              style={{ marginBottom: 10 }}
            />
            <input
              data-test-id="expiry-input"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) =>
                setCard({ ...card, expiry: e.target.value })
              }
              style={{ marginBottom: 10 }}
            />
            <input
              data-test-id="cvv-input"
              placeholder="CVV"
              value={card.cvv}
              onChange={(e) =>
                setCard({ ...card, cvv: e.target.value })
              }
              style={{ marginBottom: 10 }}
            />
            <input
              data-test-id="cardholder-name-input"
              placeholder="Name on Card"
              value={card.name}
              onChange={(e) =>
                setCard({ ...card, name: e.target.value })
              }
              style={{ marginBottom: 12 }}
            />
            <button data-test-id="pay-button">
              Pay ₹{(order.amount / 100).toFixed(2)}
            </button>
          </form>
        )}

        {/*Processing*/}
        {status === "processing" && (
          <div data-test-id="processing-state" style={{ textAlign: "center" }}>
            <p data-test-id="processing-message">
              Processing payment…
            </p>
          </div>
        )}

        {/*Success*/}
        {status === "success" && (
          <div data-test-id="success-state" style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--success)" }}>Payment Successful</h3>
            <p>
              Payment ID:
              <br />
              <span data-test-id="payment-id">{paymentId}</span>
            </p>
            <p data-test-id="success-message">
              Your payment has been processed successfully
            </p>
          </div>
        )}

        {/*Error */}
        {status === "failed" && (
          <div data-test-id="error-state" style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--error)" }}>Payment Failed</h3>
            <p data-test-id="error-message">
              {error || "Payment could not be processed"}
            </p>
            <button
              data-test-id="retry-button"
              onClick={() => {
                setStatus("idle");
                setMethod(null);
                setPaymentId(null);
                setError("");
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
