
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
import backendUrl from "../context";
import { Link } from "react-router-dom";

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "New",
    tags: "",
    notes: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/leads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeads(res.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("User role:", decoded.role);
      } catch (error) {
        console.error("Token decoding failed:", error);
      }
    }
    if (!token) {
      alert("Please log in first");
      return;
    }
    try {
      const res = await axios.post(`${backendUrl}/api/leads`, newLead, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads([...leads, res.data]);
      setNewLead({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "New",
        tags: "",
        notes: "",
        assignedTo: "",
      });
    } catch (error) {
      alert("Error creating lead: " + (error.response?.data.message || "Unknown error"));
      console.error("Error response:", error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeads(leads.filter((lead) => lead._id !== id));
    } catch (error) {
      alert("Error deleting lead");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Lead Management</h1>
      
      {/* Input Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            placeholder="Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            value={newLead.email}
            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            value={newLead.phone}
            onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            value={newLead.source}
            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
            placeholder="Source"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex gap-4">
            <select
              value={newLead.status}
              onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
              <option value="Won">Won</option>
            </select>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create Lead
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <Link 
          to='/dashboard' 
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default LeadManagement;