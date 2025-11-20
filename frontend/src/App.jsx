import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LotDetail from "./pages/LotDetail";
import AdminLots from "./pages/AdminLots";
import AdminDashboard from "./pages/AdminDashboard";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function RequireAuth({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirect to login if not authenticated */}
        <Route path="/" element={!user ? <Navigate to="/login" /> : <Dashboard />} />



        <Route
          path="/lots/:id"
          element={
            <RequireAuth>
              <LotDetail />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/lots"
          element={
            <RequireAuth role="ADMIN">
              <AdminLots />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth role="ADMIN">
              <AdminDashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
