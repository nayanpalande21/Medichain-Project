import React, { useState } from "react";
import { useEffect } from "react";
import { getMyRecords } from "./api"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import { addRecord } from "./api.js";

const RECORD_TYPES = [
  { value: "consultation", label: " Consultation", desc: "Regular doctor visit" },
  { value: "lab-report",   label: " Lab Report",   desc: "Blood test, urine, X-ray" },
  { value: "prescription", label: " Prescription",  desc: "Medicines prescribed" },
  { value: "surgery",      label: " Surgery",       desc: "Surgical procedure" },
  { value: "vaccination",  label: " Vaccination",   desc: "Immunization record" },
  { value: "other",        label: " Other",          desc: "Miscellaneous" },
];

export default function AddRecord() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    patientName: "", doctorName: "", diagnosis: "", prescription: "",
    symptoms: "", treatment: "", recordType: "consultation",
    hospital: "", notes: "", date: new Date().toISOString(),
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleTypeSelect = (type) => {
    setForm((prev) => ({ ...prev, recordType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
     const res = await addRecord(form);

console.log("RECORD SAVED:", res.data);
      setSuccess(true);
      setTimeout(() => {
 navigate("/dashboard");
}, 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox} className="fade-up">
          <div style={{ fontSize: 64, marginBottom: 16 }}></div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>
            Record Added!
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 6 }}>
            Your medical record has been securely stored.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 20 }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top nav */}
      <div style={styles.topbar}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1rem" }}>
           MediChain
        </div>
      </div>

      <div style={styles.container} className="fade-up">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Add Medical Record
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>
            This record will be securely stored in the system.
          </p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Record Type */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Record Type *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {RECORD_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => handleTypeSelect(rt.value)}
                  style={{
                    padding: "12px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                    background: form.recordType === rt.value ? "var(--teal-glow)" : "var(--navy-card)",
                    border: form.recordType === rt.value ? "1.5px solid var(--teal)" : "1.5px solid var(--navy-border)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.88rem", color: form.recordType === rt.value ? "var(--teal)" : "var(--white)", marginBottom: 2 }}>
                    {rt.label}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{rt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Patient & Doctor */}
          <div className="grid-2">
            <div className="form-group">
              <label>Patient Name *</label>
              <input name="patientName" value={form.patientName} onChange={handleChange} placeholder="Full name of patient" required />
            </div>
            <div className="form-group">
              <label>Doctor Name *</label>
              <input name="doctorName" value={form.doctorName} onChange={handleChange} placeholder="e.g. Priya Sharma" required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Hospital / Clinic</label>
              <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="e.g. City General Hospital" />
            </div>
            <div className="form-group">
              <label>Date of Visit *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>

          {/* Diagnosis */}
          <div className="form-group">
            <label>Diagnosis *</label>
            <input name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="e.g. Type 2 Diabetes Mellitus" required />
          </div>

          {/* Symptoms & Prescription */}
          <div className="grid-2">
            <div className="form-group">
              <label>Symptoms</label>
              <textarea name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="List symptoms observed..." />
            </div>
            <div className="form-group">
              <label>Prescription / Medicines</label>
              <textarea name="prescription" value={form.prescription} onChange={handleChange} placeholder="Medicines, dosage, duration..." />
            </div>
          </div>

          {/* Treatment & Notes */}
          <div className="grid-2">
            <div className="form-group">
              <label>Treatment Plan</label>
              <textarea name="treatment" value={form.treatment} onChange={handleChange} placeholder="Treatment procedure or plan..." />
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any other notes for follow-up..." />
            </div>
          </div>

          {/* Info box */}
          <div style={{ background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}></span>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.9rem", marginBottom: 3 }}>Secure Storage</div>
              <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                Your medical records are stored securely with proper authentication and data protection.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : ""}
              {loading ? " Saving..." : " Save Record"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", background: "var(--navy)", padding: "0 0 60px 0",
  },
  topbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 40px", borderBottom: "1px solid var(--navy-border)",
    background: "var(--navy-card)", position: "sticky", top: 0, zIndex: 10,
  },
  container: {
    maxWidth: 800, margin: "0 auto", padding: "48px 24px",
  },
  successBox: {
    maxWidth: 400, margin: "120px auto", background: "var(--navy-card)",
    border: "1px solid rgba(0,201,167,0.3)", borderRadius: 20,
    padding: "48px 36px", textAlign: "center",
    boxShadow: "0 0 60px rgba(0,201,167,0.1)",
  },
};