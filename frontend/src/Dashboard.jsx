import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./App.jsx";
import { getMyRecords, deleteRecord } from "./api.js";

// ─── Helpers ───────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  consultation: { bg: "rgba(0,201,167,0.12)",  color: "#00c9a7" },
  "lab-report": { bg: "rgba(99,179,237,0.12)", color: "#63b3ed" },
  prescription: { bg: "rgba(246,173,85,0.12)", color: "#f6ad55" },
  surgery:      { bg: "rgba(252,129,129,0.12)",color: "#fc8181" },
  vaccination:  { bg: "rgba(154,230,180,0.12)",color: "#9ae6b4" },
  other:        { bg: "rgba(122,147,184,0.12)", color: "#7a93b8" },
};

function TypeBadge({ type }) {
  const st = TYPE_COLORS[type] || TYPE_COLORS.other;
  return (
    <span style={{
      ...st, padding: "3px 10px", borderRadius: 6,
      fontSize: "0.72rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.05em",
      display: "inline-block",
    }}>
      {type || "other"}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function truncateHash(h) {
  if (!h) return "—";
  return h.slice(0, 8) + "…" + h.slice(-6);
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, user, onLogout }) {
  const nav = [
    { id: "dashboard",  label: "Dashboard",  icon: "" },
    { id: "records",    label: "My Records", icon: "" },
    { id: "blockchain", label: "Blockchain", icon: "" },
    { id: "profile",    label: "Profile",    icon: "" },
  ];
  return (
    <div style={sidebarStyle}>
      <div style={s.brandRow}>
        <div style={s.brandIcon}></div>
        <div>
          <div style={s.brandName}>MediChain</div>
          <div style={s.brandSub}>Medical Records</div>
        </div>
      </div>
      <nav style={{ flex: 1, marginTop: 12 }}>
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={active === item.id ? s.navItemActive : s.navItem}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
            {active === item.id && <div style={s.navIndicator} />}
          </button>
        ))}
      </nav>
      <div style={s.userCard}>
        <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: 600, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.name}
          </div>
          <div style={{ color: "var(--teal)", fontSize: "0.72rem", textTransform: "capitalize" }}>
            {user?.role}
          </div>
        </div>
        <button onClick={onLogout} title="Logout"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, padding: 4 }}>
          ⏻
        </button>
      </div>
    </div>
  );
}

const sidebarStyle = {
  width: 240, background: "var(--navy-card)", borderRight: "1px solid var(--navy-border)",
  display: "flex", flexDirection: "column", padding: "24px 16px",
  position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 10,
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = "var(--teal)", delay = 0 }) {
  return (
    <div className="card fade-up" style={{ animationDelay: `${delay}s`, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, color }}>
            {value}
          </div>
        </div>
        <div style={{ fontSize: 28, background: `${color}18`, padding: "10px 13px", borderRadius: 12, border: `1px solid ${color}30` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── InfoBlock ─────────────────────────────────────────────────────────────
function InfoBlock({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: "0.88rem" }}>{value}</div>
    </div>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────
function DashboardView({ records, onRefresh, onDelete }) {
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const total         = records.length;
  const verified      = records.filter(r => r.isVerified).length;
  const consultations = records.filter(r => r.recordType === "consultation").length;
  const labReports    = records.filter(r => r.recordType === "lab-report").length;

  const uniqueTypes = ["all", ...new Set(records.map(r => r.recordType).filter(Boolean))];

  const filtered = records.filter(r => {
  const q = search.trim().toLowerCase();

  const searchableText = `
    ${r.diagnosis || ""}
    ${r.doctorName || ""}
    ${r.hospital || ""}
    ${r.symptoms || ""}
    ${r.patientName || ""}
    ${r.recordType || ""}
  `.toLowerCase();

  const matchSearch = !q || searchableText.includes(q);
  const matchType = typeFilter === "all" || r.recordType === typeFilter;

  return matchSearch && matchType;
});

  return (
    <div className="fade-up">
      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard icon="" label="Total Records"  value={total}         color="var(--teal)" delay={0}    />
        <StatCard icon="" label="Verified"        value={verified}      color="#63b3ed"     delay={0.05} />
        <StatCard icon="" label="Consultations"  value={consultations} color="#f6ad55"     delay={0.1}  />
        <StatCard icon="" label="Lab Reports"    value={labReports}    color="#fc8181"     delay={0.15} />
      </div>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={s.pageTitle}>Medical Records</h2>
          <p style={s.pageSub}>{total} record{total !== 1 ? "s" : ""} on the blockchain</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      {/* ── Search + Type filter ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <input
  placeholder="🔍 Search records"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    flex: 1,
    minWidth: 220,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--navy-border)",
    background: "var(--navy-card)",
    color: "var(--text)",
    outline: "none",
    transition: "0.2s"
  }}
/>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            background: "var(--navy-card)", border: "1px solid var(--navy-border)",
            color: "var(--text)", padding: "8px 14px", borderRadius: 8,
            fontSize: "0.88rem", cursor: "pointer",
          }}
        >
          {uniqueTypes.map(t => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {search && (
        <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 12 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </div>
      )}

      {/* ── Records list ── */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <div>No records match your search.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(r => (
            <div key={r._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <TypeBadge type={r.recordType} />
                    {r.isVerified && (
                      <span style={{ color: "#00c9a7", fontSize: "0.78rem", fontWeight: 600 }}>Verified</span>
                    )}
                    <span style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: "auto" }}>
                      {formatDate(r.date)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{r.diagnosis}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    Dr. {r.doctorName}{r.hospital ? ` · ${r.hospital}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginLeft: 16, flexShrink: 0 }}>
                  <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)} style={btnStyle}>
                    {expandedId === r._id ? "▲ Less" : "▼ Details"}
                  </button>
                  <button onClick={() => onDelete(r._id)} style={btnDangerStyle}>🗑</button>
                </div>
              </div>

              {expandedId === r._id && (
                <div style={{
                  marginTop: 14, paddingTop: 14,
                  borderTop: "1px solid var(--navy-border)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px",
                }}>
                  {r.patientName  && <InfoBlock label="Patient"      value={r.patientName} />}
                  {r.symptoms     && <InfoBlock label="Symptoms"     value={r.symptoms} />}
                  {r.prescription && <InfoBlock label="Prescription" value={r.prescription} />}
                  {r.treatment    && <InfoBlock label="Treatment"    value={r.treatment} />}
                  {r.notes        && <InfoBlock label="Notes"        value={r.notes} />}
                  <InfoBlock label="Block #"    value={r.blockIndex ?? "—"} />
                  <InfoBlock label="Block Hash" value={
                    <code style={{ fontSize: "0.75rem", color: "var(--teal)" }}>
                      {truncateHash(r.blockHash)}
                    </code>
                  } />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── My Records View ───────────────────────────────────────────────────────
function RecordsView({ records, onDelete }) {
  const [search, setSearch]         = useState("");
  const [expandedId, setExpandedId] = useState(null);

const filtered = records.filter(r => {
  const q = search.trim().toLowerCase();

  const searchableText = `
    ${r.diagnosis || ""}
    ${r.doctorName || ""}
    ${r.hospital || ""}
    ${r.symptoms || ""}
    ${r.patientName || ""}
    ${r.recordType || ""}
  `.toLowerCase();

  return !q || searchableText.includes(q);
});
{search && (
  <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 12 }}>
    {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
  </div>
)}

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={s.pageTitle}>My Records</h2>
        <p style={s.pageSub}>All {records.length} of your medical records</p>
      </div>

     <input
  placeholder=" Search records"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    marginBottom: 20,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--navy-border)",
    background: "var(--navy-card)",
    color: "var(--text)",
    outline: "none",
    transition: "0.2s"
  }}
/>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <div>No records found.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((r, idx) => (
            <div key={r._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ color: "var(--muted)", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      #{String(idx + 1).padStart(3, "0")}
                    </span>
                    <TypeBadge type={r.recordType} />
                    {r.isVerified && (
                      <span style={{ color: "#00c9a7", fontSize: "0.78rem", fontWeight: 600 }}> Verified</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{r.diagnosis}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 4 }}>
                    Dr. {r.doctorName}{r.hospital ? ` · ${r.hospital}` : ""}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{formatDate(r.date)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginLeft: 16, flexShrink: 0 }}>
                  <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)} style={btnStyle}>
                    {expandedId === r._id ? "▲ Less" : "▼ Details"}
                  </button>
                  <button onClick={() => onDelete(r._id)} style={btnDangerStyle}>🗑</button>
                </div>
              </div>

              {expandedId === r._id && (
                <div style={{
                  marginTop: 14, paddingTop: 14,
                  borderTop: "1px solid var(--navy-border)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px",
                }}>
                  {r.patientName  && <InfoBlock label="Patient"      value={r.patientName} />}
                  {r.symptoms     && <InfoBlock label="Symptoms"     value={r.symptoms} />}
                  {r.prescription && <InfoBlock label="Prescription" value={r.prescription} />}
                  {r.treatment    && <InfoBlock label="Treatment"    value={r.treatment} />}
                  {r.notes        && <InfoBlock label="Notes"        value={r.notes} />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Blockchain View ───────────────────────────────────────────────────────
// Field names from your server.js: blockHash, previousHash, blockIndex
function BlockchainView({ records }) {
  const [expandedId, setExpandedId] = useState(null);

  // Always render chain in blockIndex order
  const chain = [...records].sort((a, b) => (a.blockIndex ?? 0) - (b.blockIndex ?? 0));

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={s.pageTitle}>Blockchain Ledger</h2>
        <p style={s.pageSub}>
          Immutable chain · {chain.length} block{chain.length !== 1 ? "s" : ""} · SHA-256 hashed server-side
        </p>
      </div>

      {chain.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⛓️</div>
          <div>No blocks yet. Add a record to start the chain.</div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical chain line */}
          <div style={{
            position: "absolute", left: 27, top: 28, bottom: 28, width: 2,
            background: "linear-gradient(to bottom, var(--teal), rgba(0,201,167,0.05))",
            zIndex: 0,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1 }}>
            {chain.map((r, index) => {
              const isGenesis = index === 0;
              const expanded  = expandedId === r._id;

              return (
                <div key={r._id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* Block number bubble */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                    background: isGenesis
                      ? "linear-gradient(135deg, var(--teal), var(--teal-dark))"
                      : "var(--navy-card)",
                    border: "2px solid var(--teal)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    boxShadow: isGenesis ? "0 0 18px rgba(0,201,167,0.35)" : "none",
                  }}>
                    <div style={{
                      fontSize: "0.58rem",
                      color: isGenesis ? "var(--navy)" : "var(--muted)",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {isGenesis ? "GEN" : "BLK"}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "0.88rem",
                      color: isGenesis ? "var(--navy)" : "var(--teal)",
                    }}>
                      #{r.blockIndex ?? index}
                    </div>
                  </div>

                  {/* Block card */}
                  <div className="card" style={{
                    flex: 1,
                    borderLeft: `3px solid ${isGenesis ? "var(--teal)" : "var(--navy-border)"}`,
                    padding: "16px 20px",
                  }}>
                    {/* Card header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <TypeBadge type={r.recordType} />
                          {isGenesis && (
                            <span style={{ fontSize: "0.72rem", color: "var(--teal)", fontWeight: 700 }}>GENESIS</span>
                          )}
                          {r.isVerified && (
                            <span style={{ fontSize: "0.72rem", color: "#00c9a7", fontWeight: 600 }}>✅ Verified</span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{r.diagnosis}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                          Dr. {r.doctorName}{r.hospital ? ` · ${r.hospital}` : ""} · {formatDate(r.date)}
                        </div>
                      </div>
                      <button onClick={() => setExpandedId(expanded ? null : r._id)} style={btnStyle}>
                        {expanded ? "▲" : "▼"} Hash
                      </button>
                    </div>

                    {/* Hash summary — always visible */}
                    <div style={{
                      background: "var(--navy-mid)", borderRadius: 8,
                      padding: "10px 14px", fontFamily: "monospace", fontSize: "0.75rem",
                    }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                        <span style={{ color: "var(--muted)", minWidth: 90 }}>Block Hash:</span>
                        <span style={{ color: "var(--teal)", wordBreak: "break-all" }}>
                          {r.blockHash
                            ? truncateHash(r.blockHash)
                            : <em style={{ color: "var(--muted)" }}>not generated</em>}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ color: "var(--muted)", minWidth: 90 }}>Prev Hash:</span>
                        <span style={{ color: isGenesis ? "#f6ad55" : "var(--muted)", wordBreak: "break-all" }}>
                          {/* your server sets previousHash to "0000" for genesis */}
                          {isGenesis
                            ? "0000 (Genesis)"
                            : (r.previousHash ? truncateHash(r.previousHash) : "—")}
                        </span>
                      </div>
                    </div>

                    {/* Expanded: full hashes + block meta */}
                    {expanded && (
                      <div style={{
                        marginTop: 10, padding: "12px 14px",
                        background: "rgba(0,201,167,0.04)",
                        border: "1px solid rgba(0,201,167,0.15)",
                        borderRadius: 8, fontFamily: "monospace", fontSize: "0.72rem",
                      }}>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ color: "var(--muted)", marginBottom: 3 }}>Full Block Hash (SHA-256):</div>
                          <div style={{ color: "var(--teal)", wordBreak: "break-all", lineHeight: 1.7 }}>
                            {r.blockHash || "—"}
                          </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ color: "var(--muted)", marginBottom: 3 }}>Full Previous Hash:</div>
                          <div style={{ color: "#63b3ed", wordBreak: "break-all", lineHeight: 1.7 }}>
                            {r.previousHash || "0000"}
                          </div>
                        </div>
                        <div style={{
                          paddingTop: 10, borderTop: "1px solid rgba(0,201,167,0.1)",
                          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
                        }}>
                          <div>
                            <span style={{ color: "var(--muted)" }}>Block Index: </span>
                            <span style={{ color: "var(--text)" }}>{r.blockIndex ?? index}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--muted)" }}>Added: </span>
                            <span style={{ color: "var(--text)" }}>{formatDate(r.createdAt)}</span>
                          </div>
                          {r.patientName && (
                            <div>
                              <span style={{ color: "var(--muted)" }}>Patient: </span>
                              <span style={{ color: "var(--text)" }}>{r.patientName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Chain link footer */}
                    {index < chain.length - 1 && (
                      <div style={{
                        marginTop: 10, fontSize: "0.72rem",
                        color: "var(--muted)", display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span></span>
                        <span>
  {r.blockIndex === 0
    ? " Genesis Block"
    : ` Linked to Block #${r.blockIndex - 1}`}
</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chain integrity footer */}
          <div style={{
            marginTop: 24, padding: "14px 20px",
            background: "rgba(0,201,167,0.05)",
            border: "1px solid rgba(0,201,167,0.18)",
            borderRadius: 12, display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 22 }}></span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Chain Integrity</div>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                {chain.length} block{chain.length !== 1 ? "s" : ""} · SHA-256 hashed in Node.js (crypto module) · Persisted in MongoDB
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile View ──────────────────────────────────────────────────────────
function ProfileView({ user }) {
  return (
    <div className="fade-up">
      <h2 style={s.pageTitle}>My Profile</h2>
      <p style={s.pageSub}>Your account information.</p>
      <div className="card" style={{ maxWidth: 520, marginTop: 24 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--navy-border)",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--teal), var(--teal-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-head)", fontSize: "1.6rem", fontWeight: 800, color: "var(--navy)",
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "1.3rem", fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: "var(--teal)", fontSize: "0.8rem", textTransform: "capitalize", marginTop: 2 }}>{user?.role}</div>
          </div>
        </div>
        {[
          { icon: "", label: "Email",       value: user?.email },
          { icon: "", label: "Phone",       value: user?.phone || "Not provided" },
          { icon: "", label: "Blood Group", value: user?.bloodGroup || "Not provided" },
          { icon: "", label: "Address",     value: user?.address || "Not provided" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{item.icon}</span>
            <div>
              <div style={{ color: "var(--muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "0.93rem", marginTop: 2 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive]   = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyRecords();
      //  /api/records returns a plain array directly
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setRecords(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteRecord(id);
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch {
      alert("Failed to delete record.");
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />

      <div style={{ marginLeft: 240, flex: 1, padding: "36px 40px", background: "var(--navy)" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 2 }}>
              {new Date().toDateString()}
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "1.1rem", fontWeight: 700 }}>
              Good day, {user?.name?.split(" ")[0]} 
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/add-record")}>
            ＋ Add Record
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : (
          <>
            {active === "dashboard"  && <DashboardView  records={records} onRefresh={fetchData} onDelete={handleDelete} />}
            {active === "records"    && <RecordsView    records={records} onDelete={handleDelete} />}
            {active === "blockchain" && <BlockchainView records={records} />}
            {active === "profile"    && <ProfileView    user={user} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────
const s = {
  brandRow:      { display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32 },
  brandIcon:     { fontSize: 22, background: "var(--teal-glow)", padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,201,167,0.25)" },
  brandName:     { fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 800 },
  brandSub:      { fontSize: "0.65rem", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.08em" },
  navItem: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "none", background: "transparent", color: "var(--muted)",
    cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.9rem",
    marginBottom: 4, textAlign: "left", transition: "all 0.2s", position: "relative",
  },
  navItemActive: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "none", background: "var(--teal-glow)", color: "var(--teal)",
    cursor: "pointer", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.9rem",
    marginBottom: 4, textAlign: "left", position: "relative",
  },
  navIndicator: {
    position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
    width: 3, height: 24, background: "var(--teal)", borderRadius: 3,
  },
  userCard: {
    display: "flex", alignItems: "center", gap: 10, padding: "12px 10px",
    background: "var(--navy-mid)", borderRadius: 12, border: "1px solid var(--navy-border)",
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--teal), var(--teal-dark))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-head)", fontWeight: 800, color: "var(--navy)", fontSize: "1rem",
    flexShrink: 0,
  },
  pageTitle: { fontFamily: "var(--font-head)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 },
  pageSub:   { color: "var(--muted)", fontSize: "0.88rem", marginTop: 4 },
};

const btnStyle = {
  background: "var(--navy-mid)", border: "1px solid var(--navy-border)",
  color: "var(--text)", padding: "5px 12px", borderRadius: 6,
  fontSize: "0.8rem", cursor: "pointer",
};

const btnDangerStyle = {
  background: "rgba(252,129,129,0.1)", border: "1px solid rgba(252,129,129,0.3)",
  color: "#fc8181", padding: "5px 12px", borderRadius: 6,
  fontSize: "0.8rem", cursor: "pointer",
};