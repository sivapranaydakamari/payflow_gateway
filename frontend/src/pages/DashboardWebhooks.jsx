import Layout from "../components/Layout";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function DashboardWebhooks() {
  const [logs, setLogs] = useState([]);

  const headers = {
    "X-Api-Key": "key_test_abc123",
    "X-Api-Secret": "secret_test_xyz789",
  };

  const fetchLogs = async () => {
    const res = await fetch(`${API}/api/v1/webhooks`, { headers });
    const data = await res.json();
    setLogs(data.data || []);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const retryWebhook = async (id) => {
    await fetch(`${API}/api/v1/webhooks/${id}/retry`, {
      method: "POST",
      headers,
    });
    fetchLogs();
  };

  return (
    <Layout title="Webhooks">
      <div
        data-test-id="webhook-config"
        style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}
      >
        {/* Webhook Info */}
        <h2>Webhook Configuration</h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#666" }}>
            Webhook Secret
          </label>
          <div data-test-id="webhook-secret">
            whsec_test_abc123
          </div>

          <p style={{ fontSize: 13, marginTop: 6 }}>
            Configure your webhook endpoint on your server to receive
            payment and refund events.
          </p>
        </div>

        {/* Logs */}
        <h3>Webhook Delivery Logs</h3>

        <table
          data-test-id="webhook-logs-table"
          width="100%"
          border="1"
          cellPadding="8"
        >
          <thead>
            <tr>
              <th>Event</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Last Attempt</th>
              <th>Response</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                data-test-id="webhook-log-item"
                data-webhook-id={log.id}
              >
                <td data-test-id="webhook-event">{log.event}</td>
                <td data-test-id="webhook-status">{log.status}</td>
                <td data-test-id="webhook-attempts">{log.attempts}</td>
                <td data-test-id="webhook-last-attempt">
                  {log.last_attempt_at || "-"}
                </td>
                <td data-test-id="webhook-response-code">
                  {log.response_code || "-"}
                </td>
                <td>
                  <button
                    data-test-id="retry-webhook-button"
                    onClick={() => retryWebhook(log.id)}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No webhook deliveries yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
