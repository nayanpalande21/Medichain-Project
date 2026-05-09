import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./App.jsx";
import { loginUser, registerUser } from "./api.js";


const DNA_SVG = (
  <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", opacity: 0.08, right: -40, bottom: -40, pointerEvents: "none" }}>
    <circle cx="170" cy="170" r="160" stroke="#00c9a7" strokeWidth="1.5" strokeDasharray="8 6" />
    <circle cx="170" cy="170" r="110" stroke="#00c9a7" strokeWidth="1" strokeDasharray="4 8" />
    <circle cx="170" cy="170" r="60" stroke="#00c9a7" strokeWidth="0.8" />
    <path d="M170 30 Q220 100 170 170 Q120 240 170 310" stroke="#00c9a7" strokeWidth="1.5" fill="none"/>
    <path d="M170 30 Q120 100 170 170 Q220 240 170 310" stroke="#00c9a7" strokeWidth="1.5" fill="none"/>
    {[70, 100, 130, 160, 190, 220, 250].map((y, i) => (
      <line key={i} x1="140" y1={y} x2="200" y2={y} stroke="#00c9a7" strokeWidth="0.8" strokeOpacity="0.6" />
    ))}
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "patient", phone: "", bloodGroup: "", address: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const { data } = await registerUser(form);
       login(data.user, data.token);


localStorage.setItem("medichain_token", data.token);

navigate("/dashboard");
      } else {
        const { data } = await loginUser({ email: form.email, password: form.password });
        login(data.user, data.token);


localStorage.setItem("medichain_token", data.token);

navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(""); setSuccess("");
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}></div>
          <div>
            <div style={styles.brandName}>MediChain</div>
            <div style={styles.brandTagline}>Blockchain Medical Records</div>
          </div>
        </div>

        <div style={styles.heroText}>
          <h1 style={styles.heroH1}>Your Health Records,<br /><span style={{ color: "var(--teal)" }}>Secured Forever.</span></h1>
          <p style={styles.heroP}>
            MediChain uses blockchain technology to store and protect your medical records —
            immutable, verified, and always accessible.
          </p>
        </div>

        <div style={styles.featureList}>
          {[
            { icon: "", label: "End-to-end encrypted records" },
            { icon: "", label: "Blockchain-verified integrity" },
            { icon: "", label: "Share with any doctor, anywhere" },
            { icon: "", label: "Access anytime, any device" },
          ].map((f) => (
            <div key={f.label} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", overflow: "hidden", height: 0 }}>{DNA_SVG}</div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard} className="fade-up">
          <h2 style={styles.formTitle}>
            {mode === "login" ? "Welcome back " : "Join MediChain "}
          </h2>
          <p style={styles.formSub}>
            {mode === "login"
              ? "Sign in to access your secure health records."
              : "Create your account to get started."}
          </p>

          {/* Mode Toggle */}
          <div style={styles.modeToggle}>
            <button style={mode === "login" ? styles.tabActive : styles.tab} onClick={() => setMode("login")}>Login</button>
            <button style={mode === "register" ? styles.tabActive : styles.tab} onClick={() => setMode("register")}>Register</button>
          </div>

          {error && <div className="alert alert-error"> {error}</div>}
          {success && <div className="alert alert-success"> {success}</div>}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Doe" required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={form.role} onChange={handleChange}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                      <option value="">Select</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : null}
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.88rem", color: "var(--muted)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleMode} style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex", minHeight: "100vh",
  },
  leftPanel: {
    flex: 1, background: "linear-gradient(145deg, #0e1628 0%, #0a0f1e 100%)",
    padding: "60px 56px", display: "flex", flexDirection: "column", justifyContent: "center",
    borderRight: "1px solid var(--navy-border)", position: "relative", overflow: "hidden",
    "@media(max-width:768px)": { display: "none" },
  },
  brand: { display: "flex", alignItems: "center", gap: 14, marginBottom: 60 },
  brandIcon: { fontSize: 34, background: "var(--teal-glow)", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,201,167,0.25)" },
  brandName: { fontFamily: "var(--font-head)", fontSize: "1.6rem", fontWeight: 800, color: "var(--white)", letterSpacing: "-0.02em" },
  brandTagline: { fontSize: "0.78rem", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 },
  heroText: { marginBottom: 40 },
  heroH1: { fontFamily: "var(--font-head)", fontSize: "2.6rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 },
  heroP: { color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 380 },
  featureList: { display: "flex", flexDirection: "column", gap: 14 },
  featureItem: { display: "flex", alignItems: "center", gap: 12 },
  featureIcon: { fontSize: 18, background: "var(--teal-glow)", padding: "6px 9px", borderRadius: 8, border: "1px solid rgba(0,201,167,0.2)" },
  rightPanel: {
    width: "480px", background: "var(--navy)", display: "flex",
    alignItems: "center", justifyContent: "center", padding: "40px 32px",
  },
  formCard: {
    width: "100%", maxWidth: 400, background: "var(--navy-card)",
    border: "1px solid var(--navy-border)", borderRadius: 20, padding: "36px 32px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  formTitle: { fontFamily: "var(--font-head)", fontSize: "1.6rem", fontWeight: 700, marginBottom: 6 },
  formSub: { color: "var(--muted)", fontSize: "0.88rem", marginBottom: 24 },
  modeToggle: {
    display: "flex", background: "var(--navy-mid)", borderRadius: 10, padding: 4, marginBottom: 24,
    border: "1px solid var(--navy-border)",
  },
  tab: {
    flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
    background: "transparent", color: "var(--muted)", fontFamily: "var(--font-head)",
    fontWeight: 600, fontSize: "0.88rem", transition: "all 0.2s",
  },
  tabActive: {
    flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
    background: "var(--teal)", color: "var(--navy)", fontFamily: "var(--font-head)",
    fontWeight: 700, fontSize: "0.88rem",
  },
};