import { useRef, useEffect } from "react";

// ─── SM-2 Algorithm ───────────────────────────────────────────────────────────
export function sm2(card, rating) {
  let { interval, easeFactor, repetitions } = card;
  if (rating < 3) { repetitions = 0; interval = 1; }
  else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    repetitions += 1;
  }
  const nextReview = new Date(Date.now() + interval * 86400000).toISOString();
  const status = repetitions >= 3 ? "mastered" : rating < 3 ? "new" : "learning";
  return { ...card, interval, easeFactor, repetitions, nextReview, status };
}

export function isDueToday(card) { return new Date(card.nextReview) <= new Date(); }

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateOptions(correctAnswer, allCards) {
  const others = shuffle(allCards.filter((c) => c.answer !== correctAnswer)).slice(0, 3);
  return shuffle([correctAnswer, ...others.map((c) => c.answer)]);
}

export function scoreBadgeColor(pct) {
  return pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function exportToAnki(deck) {
  const csv  = deck.cards.map((c) => `"${c.question.replace(/"/g, '""')}","${c.answer.replace(/"/g, '""')}"`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${deck.name.replace(/\s+/g, "_")}_anki.csv`; a.click();
  URL.revokeObjectURL(url);
}

export const ghostBtn = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: "1rem", padding: "0.2rem 0.4rem", borderRadius: 6, color: "#64748b",
};

// ─── StatPill ─────────────────────────────────────────────────────────────────
export function StatPill({ icon, label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: `${color}18`, border: `1px solid ${color}40`, borderRadius: "2rem", padding: "0.45rem 1rem", minWidth: 110 }}>
      <span style={{ fontSize: "1.1rem" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "1.15rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ mastered, learning, newCount, total }) {
  const mastPct  = total ? (mastered  / total) * 100 : 0;
  const learnPct = total ? (learning  / total) * 100 : 0;
  const newPct   = total ? (newCount  / total) * 100 : 0;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 8, borderRadius: 99, background: "#1e293b", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${mastPct}%`,  background: "#10b981", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
        <div style={{ width: `${learnPct}%`, background: "#f59e0b", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
        <div style={{ width: `${newPct}%`,   background: "#3b82f6", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", fontSize: "0.68rem", color: "#64748b" }}>
        <span><span style={{ color: "#10b981" }}>■</span> Mastered</span>
        <span><span style={{ color: "#f59e0b" }}>■</span> Learning</span>
        <span><span style={{ color: "#3b82f6" }}>■</span> New</span>
      </div>
    </div>
  );
}

// ─── TimerRing ────────────────────────────────────────────────────────────────
export function TimerRing({ seconds, total }) {
  const r = 22, circ = 2 * Math.PI * r, pct = seconds / total;
  const color = seconds > total * 0.5 ? "#10b981" : seconds > total * 0.25 ? "#f59e0b" : "#f43f5e";
  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width={56} height={56} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={28} cy={28} r={r} fill="none" stroke="#1e293b" strokeWidth={4} />
        <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s linear,stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color }}>{seconds}</div>
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
export function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * -canvas.height,
      r: Math.random() * 8 + 4, d: Math.random() * 120 + 20,
      color: ["#f59e0b","#10b981","#3b82f6","#f43f5e","#a78bfa"][Math.floor(Math.random() * 5)],
      tilt: Math.random() * 10 - 10, tiltAngle: 0, tiltSpeed: Math.random() * 0.07 + 0.05,
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); frame++;
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltSpeed; p.y += (Math.cos(frame / 20 + p.d) + 1.5) * 1.8;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        ctx.beginPath(); ctx.lineWidth = p.r / 2; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4); ctx.stroke();
      });
      if (pieces.some((p) => p.y < canvas.height + 20)) animRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }} />;
}

// ─── QuizHistoryPanel ─────────────────────────────────────────────────────────
export function QuizHistoryPanel({ history, deckName, theme, onClose }) {
  const filtered = deckName ? history.filter((h) => h.deckName === deckName) : history;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: "1.5rem", width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: theme.text }}>🧠 Quiz History</div>
            {deckName && <div style={{ fontSize: "0.72rem", color: theme.muted, marginTop: 2 }}>{deckName}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: theme.muted }}>✕</button>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: theme.muted, padding: "2rem 0", fontSize: "0.9rem" }}>No quiz attempts yet</div>
        ) : (
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[...filtered].reverse().map((h, i) => {
              const pct = Math.round((h.correct / h.total) * 100), color = scoreBadgeColor(pct);
              return (
                <div key={i} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: theme.text }}>{h.deckName}</div>
                    <div style={{ fontSize: "0.7rem", color: theme.muted, marginTop: 2 }}>{h.date}{h.time && ` · ${h.time}`} · {h.total} questions</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color }}>{pct}%</div>
                    <div style={{ fontSize: "0.68rem", color: theme.muted }}>{h.correct}/{h.total} correct</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {filtered.length > 0 && (() => {
          const best = Math.max(...filtered.map((h) => Math.round((h.correct / h.total) * 100)));
          const avg  = Math.round(filtered.reduce((a, h) => a + (h.correct / h.total) * 100, 0) / filtered.length);
          return (
            <div style={{ display: "flex", gap: "0.75rem", borderTop: `1px solid ${theme.border}`, paddingTop: "0.75rem" }}>
              {[{ label: "Best", value: `${best}%`, color: scoreBadgeColor(best) }, { label: "Average", value: `${avg}%`, color: scoreBadgeColor(avg) }, { label: "Attempts", value: filtered.length, color: "#3b82f6" }].map(({ label, value, color }) => (
                <div key={label} style={{ flex: 1, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 10, padding: "0.6rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: "0.65rem", color: theme.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}