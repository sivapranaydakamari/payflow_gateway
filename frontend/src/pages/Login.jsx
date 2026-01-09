import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (email === "test@example.com") {
      navigate("/dashboard");
    }
  };

  return (
    <div style={center}>
      <div className="card" style={{ width: 360 }}>
        <h2 style={{ marginBottom: 16 }}>Merchant Login</h2>

        <form data-test-id="login-form" onSubmit={submit}>
          <input
            data-test-id="email-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          <input
            data-test-id="password-input"
            type="password"
            placeholder="Password"
            style={{ marginBottom: 16 }}
          />

          <button data-test-id="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}

const center = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
