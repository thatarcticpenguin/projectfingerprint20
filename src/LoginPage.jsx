import { useState } from "react";

function Login({ switchToSignup }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [role, setRole] = useState("user");
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      setMessage("Enter valid 10-digit phone number.");
      return;
    }

    if (role === "admin" && employeeId.trim() === "") {
      setMessage("Employee ID required for admin.");
      return;
    }

    setOtpSent(true);
    setMessage("OTP sent successfully! (Demo OTP: 1234)");
  };

  const handleVerify = () => {
    if (otp === "1234") {
      setMessage("✅ Login Successful!");
    } else {
      setMessage("Invalid OTP.");
    }
  };

  return (
    <>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={inputStyle}
      >
        <option value="user">Paramedic</option>
        <option value="admin">Hospital Admin</option>
      </select>

      {role === "admin" && (
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          style={inputStyle}
        />
      )}

      {!otpSent ? (
        <>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <button style={buttonStyle} onClick={handleSendOtp}>
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={inputStyle}
          />

          <button style={buttonStyle} onClick={handleVerify}>
            Verify OTP
          </button>
        </>
      )}

      <p style={linkStyle} onClick={switchToSignup}>
        New user? Sign Up
      </p>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#2a5298",
  color: "white",
  cursor: "pointer",
};

const linkStyle = {
  marginTop: "15px",
  fontSize: "14px",
  color: "#2a5298",
  cursor: "pointer",
};

export default Login;