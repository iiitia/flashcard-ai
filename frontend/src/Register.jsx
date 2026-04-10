import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveUser } from "./auth";

const BACKEND = "https://flashcard-ai-o1pt.onrender.com";

export default function Register() {
  const navigate             = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!username.trim())          return setError("Username is required.");
    if (!email.trim())             return setError("Email is required.");
    if (password.length < 6)       return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      saveUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 10, padding: "0.7rem 1rem", color: "#f1f5f9",
    fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#3b82f6,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.25rem" }}>⚡ FlashForge</div>
          <div style={{ fontSize: "0.75rem", color: "#475569" }}>Spaced repetition · SM-2</div>
        </div>

        {/* Card */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "2rem", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#020817", borderRadius: 10, padding: "0.25rem", marginBottom: "1.75rem" }}>
            <Link to="/login" style={{ flex: 1, padding: "0.55rem", background: "none", borderRadius: 8, color: "#475569", fontWeight: 600, fontSize: "0.85rem", textAlign: "center", textDecoration: "none" }}>
              Sign In
            </Link>
            <div style={{ flex: 1, padding: "0.55rem", background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.85rem", textAlign: "center" }}>
              Create Account
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")} onBlur={(e) => (e.target.style.borderColor = "#1e293b")} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")} onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" style={{ ...inp, paddingRight: "3rem" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")} onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                <button onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "0.85rem", padding: 0 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "0.6rem 0.85rem", color: "#f87171", fontSize: "0.82rem" }}>⚠ {error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem", background: loading ? "#1e293b" : "linear-gradient(135deg,#3b82f6,#6366f1)", color: loading ? "#475569" : "#fff", border: "none", borderRadius: 10, padding: "0.75rem", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "inherit" }}>
              {loading
                ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #334155", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Creating account...</>
                : "Create Account →"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.75rem", color: "#334155" }}>
          Already have an account? <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}input::placeholder{color:#334155}`}</style>
    </div>
  );
}