import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { ref, get } from "firebase/database";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .login-root::before { display: none; }
  .login-root::after  { display: none; }

  .login-card {
    position: relative;
    z-index: 10;
    width: 420px;
    background: #ffffff;
    border: 1px solid #e8eaed;
    border-radius: 16px;
    padding: 48px 44px;
    backdrop-filter: blur(24px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .login-header { margin-bottom: 36px; }

  .login-eyebrow {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #2a2c31ff;
    font-weight: 500;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .login-eyebrow::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #26282cff;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.15;
    margin: 0;
    white-space: pre-line;
  }

  .login-subtitle {
    margin-top: 8px;
    font-size: 13.5px;
    color: #64748b;
    font-weight: 300;
  }

  .field-group {
    margin-bottom: 18px;
    animation: fieldIn 0.4s ease both;
  }

  @keyframes fieldIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .field-label {
    display: block;
    font-size: 11.5px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #475569;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .field-input {
    width: 100%;
    padding: 13px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    color: #0f172a;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
  }

  .field-input::placeholder { color: #94a3b8; }

  .field-input:focus {
    border-color: rgba(40, 42, 46, 0.6);
    background: rgba(56,113,254,0.06);
    box-shadow: 0 0 0 3px rgba(56,113,254,0.1);
  }

  .role-pills { display: flex; gap: 10px; }

  .role-pill {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .role-pill:hover {
    border-color: rgba(56,113,254,0.3);
    color: #2a2b2eff;
  }

  .role-pill.active {
    border-color: #353841ff;
    background: #eff6ff;
    color: #25282cff;
  }

  .btn-primary {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #33353aff 0%, #25242bff 100%);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(56,113,254,0.35);
    letter-spacing: 0.3px;
  }

  .btn-primary:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(56,113,254,0.45);
  }

  .btn-primary:active { transform: translateY(0); }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 28px 0 20px;
  }

  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  .divider span {
    font-size: 11px;
    color: #94a3b8;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .signup-link {
    text-align: center;
    font-size: 13.5px;
    color: #64748b;
  }

  .signup-link span {
    color: #2c3336ff;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s;
  }

  .signup-link span:hover { color: #1f1f20ff; }

  .message {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    line-height: 1.4;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .message.success {
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.2);
    color: #6ee7a0;
  }

  .message.error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #fca5a5;
  }

  .message.info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1f1f20ff;
  }

  .otp-hint {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
    text-align: right;
    letter-spacing: 0.5px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #94a3b8;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    transition: color 0.2s;
  }

  .back-btn:hover { color: #475569; }
`;

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  // Patient fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Admin fields
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({ text: "", type: "" });
  const setMsg = (text, type = "info") => setMessage({ text, type });

  // ── Patient OTP flow ──────────────────────────────────────────────────────
  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      setMsg("Enter a valid 10-digit phone number.", "error");
      return;
    }
    setOtpSent(true);
    setMsg("OTP sent! Demo OTP: 1234", "info");
  };

  const handleVerifyOtp = () => {
    if (otp === "1234") {
      setMsg("✓ Login successful! Welcome back.", "success");
      setTimeout(() => navigate("/form"), 800);
    } else {
      setMsg("Invalid OTP. Please try again.", "error");
    }
  };

  // ── Admin Firebase login ──────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    if (!employeeId.trim() || !password.trim()) {
      setMsg("Please enter both Employee ID and Password.", "error");
      return;
    }
    setLoading(true);
    setMsg("Verifying credentials…", "info");
    try {
      const snapshot = await get(ref(db, "hospitals"));
      const data = snapshot.val();
      if (!data) { setMsg("Could not reach database. Try again.", "error"); setLoading(false); return; }

      // Find hospital whose adminaccount matches
      const match = Object.entries(data).find(([, h]) =>
        h.adminaccount?.ID === employeeId.trim() &&
        h.adminaccount?.password === password.trim()
      );

      if (!match) {
        setMsg("Invalid Employee ID or Password.", "error");
        setLoading(false);
        return;
      }

      const [firebaseKey, hospitalData] = match;
      setMsg(`✓ Welcome, ${hospitalData.hospital_name}!`, "success");

      // Store hospital context in sessionStorage for the dashboard
      sessionStorage.setItem("adminHospital", JSON.stringify({
        firebaseKey,
        id:   hospitalData.hospital_id,
        name: hospitalData.hospital_name,
      }));

      setTimeout(() => navigate("/hdash"), 800);
    } catch (err) {
      console.error("Admin login error:", err);
      setMsg("Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-card">
          <div className="login-header">
            <div className="login-eyebrow"></div>
            <h1 className="login-title">
              {role === "admin" ? "Admin\nSign In" : otpSent ? "Verify your\nnumber" : "Welcome\nback"}
            </h1>
            <p className="login-subtitle">
              {role === "admin"
                ? "Sign in with your hospital credentials"
                : otpSent
                  ? `OTP sent to +91 ${phone}`
                  : "Sign in to continue to your dashboard"}
            </p>
          </div>

          {/* Role selector */}
          <div className="field-group">
            <label className="field-label">Sign in as</label>
            <div className="role-pills">
              <button
                className={`role-pill ${role === "user" ? "active" : ""}`}
                onClick={() => { setRole("user"); setMessage({ text: "", type: "" }); setOtpSent(false); }}
              >
                Patient
              </button>
              <button
                className={`role-pill ${role === "admin" ? "active" : ""}`}
                onClick={() => { setRole("admin"); setMessage({ text: "", type: "" }); setOtpSent(false); }}
              >
                Hospital Admin
              </button>
            </div>
          </div>

          {/* ── ADMIN FORM ── */}
          {role === "admin" && (
            <>
              <div className="field-group">
                <label className="field-label">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. APOVJAC001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="field-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  className="field-input"
                />
              </div>
              <button className="btn-primary" onClick={handleAdminLogin} disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Verifying…" : "Sign In →"}
              </button>
            </>
          )}

          {/* ── PATIENT OTP FORM ── */}
          {role === "user" && !otpSent && (
            <>
              <div className="field-group">
                <label className="field-label">Phone Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="field-input"
                  maxLength={10}
                />
              </div>
              <button className="btn-primary" onClick={handleSendOtp}>
                Send OTP →
              </button>
            </>
          )}

          {role === "user" && otpSent && (
            <>
              <button className="back-btn"
                onClick={() => { setOtpSent(false); setMessage({ text: "", type: "" }); }}>
                ← Change number
              </button>
              <div className="field-group">
                <label className="field-label">One-Time Password</label>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="field-input"
                  maxLength={4}
                />
                <p className="otp-hint">Demo OTP: 1234</p>
              </div>
              <button className="btn-primary" onClick={handleVerifyOtp}>
                Verify & Sign In →
              </button>
            </>
          )}

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="divider"><span>or</span></div>
          <p className="signup-link">
            New here?{" "}
            <span onClick={() => navigate("/register")}>Create an account</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;