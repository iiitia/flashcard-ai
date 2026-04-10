import { createContext, useContext, useState, useEffect } from "react";
import { loadUser } from "./auth";

function storageKey(userId) { return `flashcard_app_v3__${userId}`; }

function loadState(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const p   = raw ? JSON.parse(raw) : {};
    return { decks: p.decks || [], streak: p.streak || 0, lastStudyDate: p.lastStudyDate || null, quizHistory: p.quizHistory || [] };
  } catch { return { decks: [], streak: 0, lastStudyDate: null, quizHistory: [] }; }
}

function saveState(userId, state) {
  localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

const DeckContext = createContext(null);

export function DeckProvider({ children }) {
  const currentUser = loadUser();
  const [appState, setAppState] = useState(() => loadState(currentUser?.id));

  useEffect(() => {
    if (currentUser?.id) saveState(currentUser.id, appState);
  }, [appState]);

  return (
    <DeckContext.Provider value={{ appState, setAppState }}>
      {children}
    </DeckContext.Provider>
  );
}

export function useDeckState() {
  return useContext(DeckContext);
}