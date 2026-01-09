import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function Transactions() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/v1/payments`, {
      headers: {
        "X-Api-Key": "key_test_abc123",
        "X-Api-Secret": "secret_test_xyz789",
      },
    })
      .then(res => res.json())
      .then(setPayments);
  }, []);

  return (
    <Layout title="Transactions">
      <Link
        to="/dashboard"
        style={{
          display: "inline-block",
          marginBottom: 16,
          color: "var(--primary)",
        }}
      >
        ← Back to Dashboard
      </Link>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <table
          data-test-id="transactions-table"
          width="100%"
          style={{
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ color: "var(--muted)", textAlign: "left" }}>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Order</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Method</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                data-test-id="transaction-row"
                data-payment-id={p.id}
                style={{
                  borderTop: "1px solid var(--border)",
                }}
              >
                <td data-test-id="payment-id" style={tdStyle}>
                  {p.id}
                </td>
                <td data-test-id="order-id" style={tdStyle}>
                  {p.order_id}
                </td>
                <td data-test-id="amount" style={tdStyle}>
                  ₹{p.amount / 100}
                </td>
                <td data-test-id="method" style={tdStyle}>
                  {p.method}
                </td>
                <td
                  data-test-id="status"
                  style={{
                    ...tdStyle,
                    color:
                      p.status === "success"
                        ? "var(--success)"
                        : p.status === "failed"
                          ? "var(--error)"
                          : "var(--text)",
                  }}
                >
                  {p.status}
                </td>
                <td data-test-id="created-at" style={tdStyle}>
                  {new Date(p.created_at).toLocaleString()}
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "var(--muted)",
                  }}
                >
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const thStyle = {paddingBottom: 10};
const tdStyle = {padding: "10px 0"};