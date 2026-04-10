// ─── Shared auth helpers used by App, Login, Register, Dashboard ──────────────
export function loadUser() {
  try {
    const raw = localStorage.getItem("flashforge_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveUser(user) {
  if (user) localStorage.setItem("flashforge_user", JSON.stringify(user));
  else localStorage.removeItem("flashforge_user");
}