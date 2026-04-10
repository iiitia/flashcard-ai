import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDeckState } from "./DeckContext";
import { ghostBtn } from "./shared";

const BACKEND = "http://localhost:5000";

export default function CreatePage() {
  const navigate = useNavigate();
  const { theme } = useOutletContext();
  const { appState, setAppState } = useDeckState();
  const { decks } = appState;

  const [ingestText, setIngestText] = useState("");
  const [ingestName, setIngestName] = useState("");
  const [ingestFile, setIngestFile] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const handleIngest = async () => {
    if (!ingestFile && !ingestText.trim()) return showToast("Upload a PDF or paste some content first!");
    setLoading(true);
    try {
      let flashcards, deckNameFromServer;

      if (ingestFile) {
        const formData = new FormData();
        formData.append("file", ingestFile);
        formData.append("deckName", ingestName.trim());
        const res = await fetch(`${BACKEND}/upload`, { method: "POST", body: formData });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Upload failed"); }
        const data = await res.json();
        flashcards = data.flashcards; deckNameFromServer = data.deckName;
      } else {
        const res = await fetch(`${BACKEND}/generate-from-text`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: ingestText, deckName: ingestName.trim() }),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Backend error"); }
        const data = await res.json();
        flashcards = data.flashcards; deckNameFromServer = data.deckName;
      }

      const newDeck = {
        id: `deck_${Date.now()}`,
        name: ingestName.trim() || deckNameFromServer || `Deck ${decks.length + 1}`,
        createdAt: new Date().toLocaleDateString(),
        lastStudied: null,
        cards: flashcards,
      };
      setAppState((s) => ({ ...s, decks: [...s.decks, newDeck] }));
      navigate("/dashboard");
      // Small delay so navigate happens first, then toast shows on home
    } catch (e) {
      showToast(e.message || "Error generating cards. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <>
      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "0.75rem 1.5rem", color: theme.text, fontWeight: 500, zIndex: 9998, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: "1.75rem" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.25rem", color: theme.text }}>Create New Deck</div>
        <div style={{ color: theme.muted, fontSize: "0.82rem", marginBottom: "1.5rem" }}>Upload a PDF or paste text — AI generates 15–20 flashcards.</div>

        <input
          value={ingestName} onChange={(e) => setIngestName(e.target.value)}
          placeholder="Deck name (optional)"
          style={{ width: "100%", background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "0.65rem 1rem", color: theme.text, fontSize: "0.9rem", marginBottom: "0.75rem", boxSizing: "border-box", outline: "none" }}
        />

        <div
          onClick={() => document.getElementById("pdf-input").click()}
          style={{ border: `2px dashed ${ingestFile ? "#10b981" : theme.border}`, borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: "0.75rem", color: ingestFile ? "#10b981" : theme.muted, fontSize: "0.85rem", background: ingestFile ? "#0a1f0a" : "transparent" }}
        >
          {ingestFile ? (
            <span>
              📄 {ingestFile.name}
              <button onClick={(e) => { e.stopPropagation(); setIngestFile(null); }} style={{ ...ghostBtn, fontSize: "0.8rem", color: "#f43f5e" }}>✕</button>
            </span>
          ) : "📎 Click to upload a PDF"}
          <input id="pdf-input" type="file" accept=".pdf,application/pdf" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files[0]; if (f) { setIngestFile(f); setIngestText(""); } e.target.value = ""; }} />
        </div>

        {!ingestFile && (
          <>
            <div style={{ textAlign: "center", color: theme.border, fontSize: "0.75rem", marginBottom: "0.75rem" }}>— or paste text below —</div>
            <textarea
              value={ingestText} onChange={(e) => setIngestText(e.target.value)}
              placeholder="Paste your notes, textbook excerpt, or any content here..."
              rows={10}
              style={{ width: "100%", background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "0.75rem 1rem", color: theme.text, fontSize: "0.88rem", lineHeight: 1.6, resize: "vertical", marginBottom: "1rem", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
            />
          </>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: ingestFile ? "1rem" : 0 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: theme.surface, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "0.65rem 1.25rem", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
            Cancel
          </button>
          <button
            onClick={handleIngest}
            disabled={loading || (!ingestFile && !ingestText.trim())}
            style={{ flex: 1, background: loading ? theme.surface : "linear-gradient(135deg,#3b82f6,#6366f1)", color: loading ? theme.muted : "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #334155", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Generating...
              </>
            ) : "✨ Generate Flashcards"}
          </button>
        </div>
      </div>
    </>
  );
}