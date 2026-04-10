import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { loadUser, saveUser } from "./auth";
import { useDeckState } from "./DeckContext";
import { stopSpeaking, QuizHistoryPanel } from "./shared";

export default function DashboardLayout() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const currentUser  = loadUser();
  const { appState } = useDeckState();
  const { streak, quizHistory } = appState;

  const [darkMode,      setDarkMode]      = useState(true);
  const [showUserMenu,  setShowUserMenu]  = useState(false);
  const [historyModal,  setHistoryModal]  = useState(null);

  const theme = darkMode
    ? { bg: "#020817", surface: "#0f172a", border: "#1e293b", text: "#f1f5f9", muted: "#64748b", input: "#020817" }
    : { bg: "#f8fafc", surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", input: "#f1f5f9" };

  const handleLogout = () => {
    saveUser(null); stopSpeaking(); navigate("/login", { replace: true });
  };

  const isHome   = location.pathname === "/dashboard";
  const isCreate = location.pathname === "/dashboard/create";
  const initials = (currentUser?.username || currentUser?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div
      style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: "0 1rem 4rem", overflowX: "hidden", transition: "background 0.3s,color 0.3s" }}
      onClick={() => setShowUserMenu(false)}
    >
      {historyModal && (
        <QuizHistoryPanel
          history={quizHistory || []}
          deckName={historyModal === "all" ? null : historyModal}
          theme={theme}
          onClose={() => setHistoryModal(null)}
        />
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: "2rem" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div onClick={() => { stopSpeaking(); navigate("/dashboard"); }} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#3b82f6,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ⚡ FlashForge
            </div>
            <div style={{ fontSize: "0.7rem", color: theme.muted, marginTop: 1 }}>Spaced repetition · SM-2</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {/* Quiz history button — only on home */}
            {isHome && (quizHistory || []).length > 0 && (
              <button onClick={() => setHistoryModal("all")} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "2rem", padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer", color: "#a78bfa", fontWeight: 600 }}>
                🧠 History
              </button>
            )}

            {/* Dark mode toggle */}
            <button onClick={() => setDarkMode((d) => !d)} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "2rem", padding: "0.35rem 0.75rem", fontSize: "0.85rem", cursor: "pointer", color: theme.text }}>
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* Streak */}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "2rem", padding: "0.35rem 0.9rem", fontSize: "0.85rem", fontWeight: 600, color: "#f59e0b" }}>
              🔥 {streak} day{streak !== 1 ? "s" : ""}
            </div>

            {/* New Deck button — hide on create page */}
            {!isCreate && (
              <button onClick={() => navigate("/dashboard/create")} style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "0.5rem 1.1rem", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                + New Deck
              </button>
            )}

            {/* Avatar / user menu */}
            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowUserMenu((s) => !s)} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#a78bfa)", border: "none", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {initials}
              </button>
              {showUserMenu && (
                <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", right: 0, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "0.5rem", minWidth: 180, zIndex: 500, boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>
                  <div style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${theme.border}`, marginBottom: "0.4rem" }}>
                    <div style={{ fontWeight: 600, color: theme.text, fontSize: "0.88rem" }}>{currentUser?.username || "User"}</div>
                    <div style={{ color: theme.muted, fontSize: "0.72rem", marginTop: 2, wordBreak: "break-all" }}>{currentUser?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ width: "100%", background: "none", border: "none", borderRadius: 8, padding: "0.55rem 0.75rem", textAlign: "left", color: "#f43f5e", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1f0a0a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Page content injected here ── */}
        <Outlet context={{ theme, setHistoryModal }} />
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        html,body{overflow-x:hidden;background:${theme.bg};margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#334155}
        input:focus,textarea:focus{border-color:#3b82f6!important}
        button{font-family:inherit}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:${theme.surface}}
        ::-webkit-scrollbar-thumb{background:${theme.border};border-radius:3px}
      `}</style>
    </div>
  );
}