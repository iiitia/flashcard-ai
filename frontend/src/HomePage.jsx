import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDeckState } from "./DeckContext";
import { isDueToday, scoreBadgeColor, exportToAnki, ghostBtn, StatPill, ProgressBar } from "./shared";

function DeckCard({ deck, onStudy, onQuiz, onDelete, onRename, onExport, onViewHistory, quizHistory, theme }) {
  const cards    = deck.cards || [];
  const mastered = cards.filter((c) => c.status === "mastered").length;
  const learning = cards.filter((c) => c.status === "learning").length;
  const newCards = cards.filter((c) => c.status === "new").length;
  const due      = cards.filter(isDueToday).length;
  const pct      = cards.length ? Math.round((mastered / cards.length) * 100) : 0;
  const deckHistory = quizHistory.filter((h) => h.deckName === deck.name);
  const bestScore   = deckHistory.length ? Math.max(...deckHistory.map((h) => Math.round((h.correct / h.total) * 100))) : null;

  return (
    <div
      style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem", transition: "border-color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#334155")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.border)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, color: theme.text, fontSize: "1.05rem" }}>{deck.name}</div>
          <div style={{ color: theme.muted, fontSize: "0.72rem", marginTop: 2 }}>
            {cards.length} cards · created {deck.createdAt}
            {deck.lastStudied && <span> · last studied {deck.lastStudied}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button onClick={() => onExport(deck)} title="Export to Anki CSV" style={ghostBtn}>📤</button>
          <button onClick={() => onRename(deck.id)} title="Rename" style={ghostBtn}>✏️</button>
          <button onClick={() => onDelete(deck.id)} title="Delete" style={{ ...ghostBtn, color: "#f43f5e" }}>🗑</button>
        </div>
      </div>

      <ProgressBar mastered={mastered} learning={learning} newCount={newCards} total={cards.length} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.72rem", color: theme.muted, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "#10b981" }}>✓ {mastered}</span>
          <span style={{ color: "#f59e0b" }}>↺ {learning}</span>
          <span style={{ color: "#3b82f6" }}>✦ {newCards}</span>
          {due > 0 && <span style={{ color: "#f43f5e" }}>📅 {due} due</span>}
          <span style={{ color: "#a78bfa" }}>{pct}%</span>
          {bestScore !== null && (
            <button onClick={() => onViewHistory(deck.name)} style={{ background: `${scoreBadgeColor(bestScore)}18`, border: `1px solid ${scoreBadgeColor(bestScore)}40`, borderRadius: 6, padding: "0.1rem 0.45rem", color: scoreBadgeColor(bestScore), fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>
              🏆 Best: {bestScore}%
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {cards.length >= 4 && (
            <button onClick={() => onQuiz(deck.id)} style={{ background: "#2d1b69", color: "#a78bfa", border: "1px solid #4c1d95", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              🧠 Quiz
            </button>
          )}
          <button
            onClick={() => onStudy(deck.id)}
            disabled={cards.length === 0}
            style={{ background: due > 0 ? "#f43f5e" : "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 1.1rem", fontSize: "0.8rem", fontWeight: 600, cursor: cards.length === 0 ? "not-allowed" : "pointer", opacity: cards.length === 0 ? 0.4 : 1 }}
          >
            {due > 0 ? `Study (${due} due)` : pct === 100 ? "Review" : "Study"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, setHistoryModal } = useOutletContext();
  const { appState, setAppState }  = useDeckState();
  const { decks, quizHistory }     = appState;
  const [searchQuery, setSearchQuery] = useState("");

  const allCards      = decks.flatMap((d) => d.cards);
  const totalMastered = allCards.filter((c) => c.status === "mastered").length;
  const totalLearning = allCards.filter((c) => c.status === "learning").length;
  const totalNew      = allCards.filter((c) => c.status === "new").length;
  const totalDue      = allCards.filter(isDueToday).length;

  const filteredDecks = searchQuery.trim().length < 2
    ? decks
    : decks.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.cards || []).some((c) =>
          c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

  const deleteDeck = (id) => {
    if (!window.confirm("Delete this deck?")) return;
    setAppState((s) => ({ ...s, decks: s.decks.filter((d) => d.id !== id) }));
  };

  const renameDeck = (id) => {
    const name = window.prompt("New deck name:");
    if (!name) return;
    setAppState((s) => ({ ...s, decks: s.decks.map((d) => d.id === id ? { ...d, name } : d) }));
  };

  const goStudy = (deckId) => navigate(`/dashboard/study/${deckId}`);
  const goQuiz  = (deckId) => navigate(`/dashboard/study/${deckId}?mode=quiz`);

  return (
    <>
      {/* Overall progress */}
      {allCards.length > 0 && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: theme.muted, textTransform: "uppercase", marginBottom: "0.9rem", fontWeight: 600 }}>Overall Progress</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
            <StatPill icon="🟢" label="Mastered"  value={totalMastered} color="#10b981" />
            <StatPill icon="🟡" label="Learning"  value={totalLearning} color="#f59e0b" />
            <StatPill icon="🔵" label="New"        value={totalNew}      color="#3b82f6" />
            {totalDue > 0 && <StatPill icon="📅" label="Due Today" value={totalDue} color="#f43f5e" />}
          </div>
          <ProgressBar mastered={totalMastered} learning={totalLearning} newCount={totalNew} total={allCards.length} />
        </div>
      )}

      {/* Search */}
      {decks.length > 1 && (
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: theme.muted, fontSize: "0.9rem" }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks or cards..."
            style={{ width: "100%", background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "0.6rem 1rem 0.6rem 2.2rem", color: theme.text, fontSize: "0.88rem", boxSizing: "border-box", outline: "none" }}
          />
        </div>
      )}

      {/* Deck list */}
      {decks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", color: theme.muted }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: theme.text }}>No decks yet</div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>Upload a PDF or paste any content to get started</div>
          <button onClick={() => navigate("/dashboard/create")} style={{ marginTop: "1.5rem", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
            + Create First Deck
          </button>
        </div>
      ) : filteredDecks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: theme.muted }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍</div>
          <div>No decks or cards match "{searchQuery}"</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {[...filteredDecks]
            .sort((a, b) => (b.cards || []).filter(isDueToday).length - (a.cards || []).filter(isDueToday).length)
            .map((deck) => (
              <DeckCard
                key={deck.id} deck={deck} theme={theme}
                onStudy={goStudy} onQuiz={goQuiz}
                onDelete={deleteDeck} onRename={renameDeck}
                onExport={exportToAnki}
                onViewHistory={(name) => setHistoryModal(name)}
                quizHistory={quizHistory || []}
              />
            ))}
        </div>
      )}
    </>
  );
}