import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams, useOutletContext } from "react-router-dom";
import { useDeckState } from "./DeckContext";
import { sm2, isDueToday, shuffle, generateOptions, stopSpeaking, ghostBtn, TimerRing, ProgressBar, Confetti } from "./shared";

const BACKEND      = "http://localhost:5000";
const TIMER_TOTAL  = 15;

// ─── FlashCard ────────────────────────────────────────────────────────────────
function FlashCard({ card, onRate, onExplain, explanation, loadingExplain, timerMode, timeLeft, totalTime, speaking, onSpeak, onStopSpeak, theme }) {
  const [flipped,  setFlipped]  = useState(false);
  const [animKey,  setAnimKey]  = useState(0);
  useEffect(() => { setFlipped(false); setAnimKey((k) => k + 1); stopSpeaking(); }, [card.id]);

  return (
    <div key={animKey} style={{ perspective: 1200, width: "100%", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        {timerMode ? <TimerRing seconds={timeLeft} total={totalTime} /> : <div />}
        <button
          onClick={() => speaking ? onStopSpeak() : onSpeak(flipped ? card.answer : card.question)}
          style={{ background: speaking ? "#1e3a5f" : theme.surface, border: `1px solid ${speaking ? "#3b82f6" : theme.border}`, borderRadius: 8, padding: "0.35rem 0.75rem", color: speaking ? "#3b82f6" : theme.muted, cursor: "pointer", fontSize: "0.8rem" }}
        >
          {speaking ? "🔊 Stop" : "🔊 Read"}
        </button>
      </div>

      <div onClick={() => setFlipped((f) => !f)} style={{ position: "relative", width: "100%", minHeight: 240, cursor: "pointer", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.55s cubic-bezier(.4,0,.2,1)" }}>
        {/* Front */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: "linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid #334155", borderRadius: 20, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 600 }}>Question</div>
          <div style={{ fontSize: "1.25rem", color: "#f1f5f9", textAlign: "center", lineHeight: 1.6, fontFamily: "'Georgia',serif" }}>{card.question}</div>
          <div style={{ marginTop: "1.5rem", fontSize: "0.72rem", color: "#475569" }}>tap to reveal · [Space]</div>
        </div>
        {/* Back */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg,#0c1a0c,#14291a)", border: "1px solid #1a4a2a", borderRadius: 20, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#10b981", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 600 }}>Answer</div>
          <div style={{ fontSize: "1.2rem", color: "#d1fae5", textAlign: "center", lineHeight: 1.6, fontFamily: "'Georgia',serif" }}>{card.answer}</div>
          <button onClick={(e) => { e.stopPropagation(); onExplain(); }} style={{ marginTop: "1rem", background: "none", border: "1px solid #1a4a2a", borderRadius: 8, padding: "0.3rem 0.9rem", color: "#4ade80", fontSize: "0.72rem", cursor: "pointer" }}>
            {loadingExplain ? "Loading..." : "💡 Explain this"}
          </button>
          {explanation && <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#86efac", textAlign: "center", lineHeight: 1.5, fontStyle: "italic", background: "#0a1f0a", borderRadius: 8, padding: "0.6rem 0.8rem", maxWidth: "100%" }}>{explanation}</div>}
        </div>
      </div>

      {/* Rating buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "center", opacity: flipped ? 1 : 0, pointerEvents: flipped ? "auto" : "none", transition: "opacity 0.3s ease" }}>
        {[{ rating: 1, label: "Hard", emoji: "😓", color: "#f43f5e" }, { rating: 3, label: "Okay", emoji: "😐", color: "#f59e0b" }, { rating: 5, label: "Easy", emoji: "😄", color: "#10b981" }].map(({ rating, label, emoji, color }) => (
          <button key={rating} onClick={(e) => { e.stopPropagation(); onRate(rating); }}
            style={{ background: `${color}18`, border: `1.5px solid ${color}60`, borderRadius: 12, padding: "0.6rem 1.4rem", color, fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${color}30`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.transform = "translateY(0)"; }}>
            {emoji} {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── QuizCard ─────────────────────────────────────────────────────────────────
function QuizCard({ card, allCards, onAnswer, questionNum, total }) {
  const [selected, setSelected] = useState(null);
  const [animKey,  setAnimKey]  = useState(0);
  const options = useRef(generateOptions(card.answer, allCards));
  useEffect(() => { setSelected(null); setAnimKey((k) => k + 1); options.current = generateOptions(card.answer, allCards); }, [card.id]);

  const handleSelect = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt === card.answer), 1200);
  };

  return (
    <div key={animKey} style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid #334155", borderRadius: 20, padding: "2rem", marginBottom: "1.25rem", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: "0.7rem", color: "#3b82f6", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.75rem" }}>Question {questionNum} of {total}</div>
        <div style={{ fontSize: "1.2rem", color: "#f1f5f9", lineHeight: 1.6, fontFamily: "'Georgia',serif" }}>{card.question}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {options.current.map((opt, i) => {
          let bg = "#0f172a", border = "#1e293b", color = "#f1f5f9";
          if (selected !== null) {
            if (opt === card.answer)   { bg = "#0a1f0a"; border = "#10b981"; color = "#4ade80"; }
            else if (opt === selected) { bg = "#1f0a0a"; border = "#f43f5e"; color = "#f87171"; }
            else color = "#475569";
          }
          return (
            <button key={i} onClick={() => handleSelect(opt)}
              style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "0.85rem 1.25rem", color, fontSize: "0.95rem", textAlign: "left", cursor: selected !== null ? "default" : "pointer", transition: "all 0.2s", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.75rem" }}
              onMouseEnter={(e) => { if (selected === null) e.currentTarget.style.borderColor = "#334155"; }}
              onMouseLeave={(e) => { if (selected === null) e.currentTarget.style.borderColor = "#1e293b"; }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: selected !== null && opt === card.answer ? "#10b981" : selected === opt ? "#f43f5e" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, color: selected !== null && (opt === card.answer || opt === selected) ? "#fff" : "#64748b" }}>
                {["A","B","C","D"][i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── StudyPage ────────────────────────────────────────────────────────────────
export default function StudyPage() {
  const navigate           = useNavigate();
  const { deckId }         = useParams();
  const [searchParams]     = useSearchParams();
  const isQuiz             = searchParams.get("mode") === "quiz";
  const { theme }          = useOutletContext();
  const { appState, setAppState } = useDeckState();
  const { decks }          = appState;

  const deck = decks.find((d) => d.id === deckId);

  // Build card queue once on mount
  const [cardQueue, setCardQueue] = useState(() => {
    if (!deck) return [];
    if (isQuiz) return shuffle(deck.cards);
    const due = deck.cards.filter(isDueToday);
    return due.length > 0 ? due : deck.cards.slice(0, 10);
  });

  const [cardIndex,      setCardIndex]      = useState(0);
  const [explanation,    setExplanation]    = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [timerMode,      setTimerMode]      = useState(false);
  const [timeLeft,       setTimeLeft]       = useState(TIMER_TOTAL);
  const [speaking,       setSpeaking]       = useState(false);
  const [quizScore,      setQuizScore]      = useState({ correct: 0, total: 0 });
  const [confetti,       setConfetti]       = useState(false);
  const [done,           setDone]           = useState(false);
  const timerRef = useRef(null);

  // Redirect if deck not found
  useEffect(() => { if (!deck) navigate("/dashboard"); }, [deck]);

  // Timer
  useEffect(() => {
    if (!timerMode) return;
    setTimeLeft(TIMER_TOTAL);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleRate(1); return TIMER_TOTAL; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cardIndex, timerMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (isQuiz) return;
      if (e.key === "1") document.querySelector(".rate-1")?.click();
      if (e.key === "2") document.querySelector(".rate-2")?.click();
      if (e.key === "3") document.querySelector(".rate-3")?.click();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isQuiz]);

  const handleSpeak = (text) => {
    setSpeaking(true);
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  };

  const handleExplain = async () => {
    const card = cardQueue[cardIndex]; if (!card || loadingExplain) return;
    setLoadingExplain(true);
    try {
      const res = await fetch(`${BACKEND}/explain`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: card.question, answer: card.answer }) });
      const data = await res.json(); setExplanation(data.explanation || "");
    } catch { setExplanation("Could not load explanation."); }
    setLoadingExplain(false);
  };

  const finishSession = useCallback((updatedCard, updated) => {
    const allMastered = deck?.cards.every((c) =>
      c.id === updatedCard.id ? updated.status === "mastered" : c.status === "mastered"
    );
    if (allMastered) { setConfetti(true); setTimeout(() => setConfetti(false), 5000); }
    setDone(true);
  }, [deck]);

  const handleRate = useCallback((rating) => {
    clearInterval(timerRef.current);
    const card    = cardQueue[cardIndex];
    const updated = sm2(card, rating);
    setExplanation(""); setSpeaking(false);

    setAppState((s) => {
      const newDecks = s.decks.map((d) => d.id !== deckId ? d : {
        ...d,
        lastStudied: new Date().toLocaleDateString(),
        cards: d.cards.map((c) => c.id === card.id ? updated : c),
      });
      const today     = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let newStreak = s.streak;
      if (s.lastStudyDate !== today) newStreak = s.lastStudyDate === yesterday ? s.streak + 1 : 1;
      return { ...s, decks: newDecks, streak: newStreak, lastStudyDate: today };
    });

    if (cardIndex + 1 >= cardQueue.length) finishSession(card, updated);
    else setCardIndex((i) => i + 1);
  }, [cardIndex, cardQueue, deckId, finishSession]);

  const handleQuizAnswer = useCallback((correct) => {
    const newScore = { correct: quizScore.correct + (correct ? 1 : 0), total: quizScore.total + 1 };
    setQuizScore(newScore);
    if (cardIndex + 1 >= cardQueue.length) {
      const entry = {
        deckName: deck?.name || "Unknown",
        correct: newScore.correct, total: newScore.total,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setAppState((s) => ({ ...s, quizHistory: [...(s.quizHistory || []), entry] }));
      setDone(true);
    } else {
      setCardIndex((i) => i + 1);
    }
  }, [cardIndex, cardQueue, deck, quizScore]);

  const currentCard = cardQueue[cardIndex];
  const streak = appState.streak;

  // ── Done screen ───────────────────────────────────────────────────────────
  if (done) {
    const scorePct = isQuiz ? Math.round((quizScore.correct / quizScore.total) * 100) : null;
    const scoreColor = scorePct !== null ? (scorePct >= 80 ? "#10b981" : scorePct >= 60 ? "#f59e0b" : "#f43f5e") : null;

    return (
      <>
        <Confetti active={confetti} />
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{isQuiz ? "🧠" : "🎉"}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.5rem", color: theme.text }}>{isQuiz ? "Quiz Complete!" : "Session complete!"}</div>

          {isQuiz ? (
            <>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: scoreColor, margin: "1rem 0" }}>{quizScore.correct} / {quizScore.total}</div>
              <div style={{ color: theme.muted, marginBottom: "0.5rem" }}>{scorePct}% correct</div>
              <div style={{ color: "#f59e0b", fontWeight: 600, marginBottom: "1.5rem" }}>
                {scorePct >= 80 ? "🌟 Excellent!" : scorePct >= 60 ? "👍 Good job!" : "📖 Keep studying!"}
              </div>
            </>
          ) : (
            <>
              <div style={{ color: theme.muted, marginBottom: "0.5rem" }}>{cardQueue.length} card{cardQueue.length !== 1 ? "s" : ""} reviewed</div>
              <div style={{ color: "#f59e0b", fontWeight: 600, fontSize: "1rem", marginBottom: "2rem" }}>🔥 {streak}-day streak!</div>
              {deck && (
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
                  <ProgressBar
                    mastered={deck.cards.filter((c) => c.status === "mastered").length}
                    learning={deck.cards.filter((c) => c.status === "learning").length}
                    newCount={deck.cards.filter((c) => c.status === "new").length}
                    total={deck.cards.length}
                  />
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => { setCardIndex(0); setDone(false); setQuizScore({ correct: 0, total: 0 }); setCardQueue(isQuiz ? shuffle(deck.cards) : (() => { const due = deck.cards.filter(isDueToday); return due.length > 0 ? due : deck.cards.slice(0, 10); })()); }}
              style={{ background: theme.surface, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "0.65rem 1.3rem", fontWeight: 600, cursor: "pointer" }}
            >
              {isQuiz ? "Retry Quiz" : "Study Again"}
            </button>
            {isQuiz && (
              <button onClick={() => navigate(`/dashboard/study/${deckId}`)} style={{ background: "#2d1b69", color: "#a78bfa", border: "1px solid #4c1d95", borderRadius: 10, padding: "0.65rem 1.3rem", fontWeight: 600, cursor: "pointer" }}>
                Switch to Flashcards
              </button>
            )}
            <button onClick={() => navigate("/dashboard")} style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
              Back to Decks
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!currentCard) return null;

  // ── Study/Quiz screen ─────────────────────────────────────────────────────
  return (
    <>
      <Confetti active={confetti} />

      {/* Shortcut hint */}
      {!isQuiz && (
        <div style={{ position: "fixed", bottom: "1rem", right: "1rem", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "0.5rem 0.75rem", fontSize: "0.68rem", color: theme.muted, lineHeight: 1.7, zIndex: 100 }}>
          <div style={{ fontWeight: 600, marginBottom: "0.2rem", color: theme.text }}>Shortcuts</div>
          <div>[Space] Flip · [1/2/3] Rate</div>
        </div>
      )}

      {/* Study header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button onClick={() => { clearInterval(timerRef.current); stopSpeaking(); navigate("/dashboard"); }} style={{ ...ghostBtn, color: theme.muted, fontSize: "0.85rem" }}>
          ← Back
        </button>
        <div style={{ fontWeight: 600, color: theme.muted, fontSize: "0.85rem" }}>
          {isQuiz ? "🧠 Quiz" : "📚 Study"} · {deck?.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {!isQuiz && (
            <button onClick={() => setTimerMode((t) => !t)} style={{ background: timerMode ? "#7c3aed20" : theme.surface, border: `1px solid ${timerMode ? "#7c3aed" : theme.border}`, borderRadius: 8, padding: "0.3rem 0.6rem", color: timerMode ? "#a78bfa" : theme.muted, fontSize: "0.75rem", cursor: "pointer" }}>
              ⏱ Timer
            </button>
          )}
          <div style={{ color: theme.muted, fontSize: "0.82rem" }}>{cardIndex + 1} / {cardQueue.length}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: theme.surface, borderRadius: 99, marginBottom: "2rem", overflow: "hidden" }}>
        <div style={{ width: `${((cardIndex + 1) / cardQueue.length) * 100}%`, height: "100%", background: isQuiz ? "linear-gradient(90deg,#a78bfa,#7c3aed)" : "linear-gradient(90deg,#3b82f6,#a78bfa)", transition: "width 0.4s ease" }} />
      </div>

      {isQuiz
        ? <QuizCard card={currentCard} allCards={deck?.cards || []} onAnswer={handleQuizAnswer} questionNum={cardIndex + 1} total={cardQueue.length} />
        : <FlashCard card={currentCard} onRate={handleRate} onExplain={handleExplain} explanation={explanation} loadingExplain={loadingExplain} timerMode={timerMode} timeLeft={timeLeft} totalTime={TIMER_TOTAL} speaking={speaking} onSpeak={handleSpeak} onStopSpeak={() => { stopSpeaking(); setSpeaking(false); }} theme={theme} />
      }
    </>
  );
}