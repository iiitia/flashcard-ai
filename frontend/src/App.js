import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login    from "./Login";
import Register from "./Register";
import { loadUser } from "./auth";
import { DeckProvider } from "./DeckContext";
import DashboardLayout from "./DashboardLayout";
import HomePage   from "./HomePage";
import StudyPage  from "./StudyPage";
import CreatePage from "./CreatePage";

function ProtectedRoute({ children }) {
  return loadUser() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All /dashboard/* routes share DeckProvider + DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DeckProvider>
                <DashboardLayout />
              </DeckProvider>
            </ProtectedRoute>
          }
        >
          <Route index                  element={<HomePage />} />
          <Route path="create"          element={<CreatePage />} />
          <Route path="study/:deckId"   element={<StudyPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}