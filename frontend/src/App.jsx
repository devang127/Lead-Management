
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeadAdminPanel from "./pages/LeadAdminPanel";
import UserManagement from "./pages/UserManagement";
import LeadManagement from "./pages/LeadManagement";
import LeadList from "./components/LeadList"; 
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/signup" element={<Signup />} /> */}
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/leads" element={<LeadAdminPanel />} />
          <Route
            path="/admin/users"
            element={<UserManagement />}
            allowedRoles={["super-admin"]}
          />
          <Route
            path="/leads"
            element={<LeadManagement />}
            allowedRoles={["super-admin", "sub-admin", "support-agent"]}
          />
          {/* Add the LeadList route */}
          <Route
            path="/leadlist"
            element={<LeadList />}
            allowedRoles={["super-admin", "sub-admin"]} 
          />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;