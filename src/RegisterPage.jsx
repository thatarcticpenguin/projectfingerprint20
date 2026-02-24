import { useState } from "react";

function Signup({ switchToLogin }) {
  const [role, setRole] = useState("user");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      alert("Aadhaar number must contain exactly 12 digits.");
      return;
    }

    setOtpSent(true);
    setMessage("OTP sent successfully! Demo OTP: 1234");
  };

  const handleSignup = () => {
    if (otp !== "1234") {
      setMessage("❌ Wrong OTP entered.");
      return;
    }

    if (password.length < 7) {
      setMessage("Password must contain at least 7 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (role === "admin") {
      if (hospitalName.trim() === "") {
        setMessage("Hospital Name is required for Admin.");
        return;
      }

      if (employeeId.trim() === "") {
        setMessage("Employee ID is required for Admin.");
        return;
      }
    }

    setMessage("✅ Registration Successful!");
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
        <>
          <input
            type="text"
            placeholder="Hospital Name"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            style={inputStyle}
          />
        </>
      )}

      <input
        type="text"
        placeholder="Phone Number"
        maxLength="10"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value.replace(/\D/g, ""))
        }
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Aadhaar Number"
        maxLength="12"
        value={aadhaar}
        onChange={(e) =>
          setAadhaar(e.target.value.replace(/\D/g, ""))
        }
        style={inputStyle}
      />

      {!otpSent ? (
        <button style={buttonStyle} onClick={handleSendOtp}>
          Send OTP
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP (Demo: 1234)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password (min 7 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />

          <button style={buttonStyle} onClick={handleSignup}>
            Register
          </button>
        </>
      )}

      <p style={linkStyle} onClick={switchToLogin}>
        Already registered? Login
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

export default Signup;