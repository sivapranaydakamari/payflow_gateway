import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, amount: 0, rate: 0 });

  useEffect(() => {
    fetch(`${API}/api/v1/payments`, {
      headers: {
        "X-Api-Key": "key_test_abc123",
        "X-Api-Secret": "secret_test_xyz789",
      },
    })
      .then(res => res.json())
      .then(data => {
        const total = data.length;
        const success = data.filter(p => p.status === "success");
        const amount = success.reduce((s, p) => s + p.amount, 0);
        setStats({
          total,
          amount,
          rate: total ? Math.round((success.length / total) * 100) : 0,
        });
      });
  }, []);

  return (
    <Layout title="Dashboard">
      <div
        data-test-id="dashboard"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 20,
        }}
      >
        {/* API Credentials */}
        <div
          data-test-id="api-credentials"
          style={{
            background: "var(--card)",
            padding: 16,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "var(--muted)" }}>
              API Key
            </label>
            <div data-test-id="api-key">key_test_abc123</div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: "var(--muted)" }}>
              API Secret
            </label>
            <div data-test-id="api-secret">secret_test_xyz789</div>
          </div>
        </div>

        {/* Stats */}
        <div
          data-test-id="stats-container"
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Stat
            label="Transactions"
            value={stats.total}
            testId="total-transactions"
          />
          <Stat
            label="Total Amount"
            value={`₹${stats.amount / 100}`}
            testId="total-amount"
          />
          <Stat
            label="Success Rate"
            value={`${stats.rate}%`}
            testId="success-rate"
          />
        </div>

        {/* Link */}
        <Link
          to="/dashboard/transactions"
          style={{ color: "var(--primary)" }}
        >
          View Transactions →
        </Link>
      </div>
    </Layout>
  );

}

function Stat({ label, value, testId }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--card)",
        padding: 16,
        borderRadius: 10,
      }}
    >
      <small style={{ color: "var(--muted)" }}>{label}</small>
      <div
        data-test-id={testId}
        style={{ fontSize: 22, marginTop: 6 }}
      >
        {value}
      </div>
    </div>
  );
}

