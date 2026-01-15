import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import DashboardWebhooks from "./pages/DashboardWebhooks";
import DashboardDocs from "./pages/DashboardDocs";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/transactions" element={<Transactions />} />
      <Route path="/dashboard/webhooks" element={<DashboardWebhooks />} />
      <Route path="/dashboard/docs" element={<DashboardDocs />} />
      <Route path="*" element={<Navigate to="/login" />} />   
    </Routes>
  );
}
