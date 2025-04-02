
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import backendUrl from "../context";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    totalUsers: 0,
    unassignedLeads: 0,
  });
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setUserRole(decoded.role);

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/login");
        }
      }
    };
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalLeads}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.newLeads}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-600">Contacted Leads</p>
              <p className="text-2xl font-bold text-purple-600">{stats.contactedLeads}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.qualifiedLeads}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-600">Won Leads</p>
              <p className="text-2xl font-bold text-green-600">{stats.wonLeads}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-600">Lost Leads</p>
              <p className="text-2xl font-bold text-red-600">{stats.lostLeads}</p>
            </div>
            {userRole === "super-admin" && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
            )}
          </div>

          {userRole === "support-agent" && stats.totalLeads === 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <p className="text-yellow-800 text-sm">
                No leads are currently assigned to you.
                {stats.unassignedLeads > 0 && (
                  <span> There are {stats.unassignedLeads} unassigned leads available.</span>
                )}
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            {userRole === "super-admin" && (
              <Link
                to="/leads"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Lead Management
              </Link>
            )}
            <Link
              to="/admin/leads"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Go to Leads Panel
            </Link>
            {userRole === "super-admin" && (
              <Link
                to="/admin/users"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Manage Users
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;