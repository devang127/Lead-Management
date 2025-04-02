
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import backendUrl from "../context";

const LeadAdminPanel = () => {
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    tags: [],
    notes: "",
    assignedTo: "",
    source: "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    tags: "",
    startDate: "",
    endDate: "",
    assignedTo: "",
    search: "",
  });
  const [users, setUsers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [exportFields, setExportFields] = useState({
    name: true,
    email: true,
    phone: true,
    source: true,
    status: true,
    tags: true,
    notes: true,
    assignedTo: true,
    createdAt: true,
    updatedAt: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setUserRole(decoded.role);

    const fetchData = async () => {
      try {
        setLoading(true);

        const leadsRes = await axios.get(`${backendUrl}/api/leads`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        });
        const leadsData = Array.isArray(leadsRes.data) ? leadsRes.data : [];
        setLeads(leadsData);

        if (decoded.role !== "support-agent") {
          const usersRes = await axios.get(`${backendUrl}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(usersRes.data);
        }

        const tagsRes = await axios.get(`${backendUrl}/api/leads/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableTags(tagsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      tags: "",
      startDate: "",
      endDate: "",
      assignedTo: "",
      search: "",
    });
  };

  const handleExportFieldChange = (e) => {
    const { name, checked } = e.target;
    setExportFields((prev) => ({ ...prev, [name]: checked }));
  };

  const handleExport = async () => {
    try {
      const selectedFields = Object.keys(exportFields)
        .filter((field) => exportFields[field])
        .join(",");
      const exportUrl = `${backendUrl}/api/leads/export?${new URLSearchParams({
        ...filters,
        fields: selectedFields,
      }).toString()}`;
      const token = localStorage.getItem("token");

      const res = await axios.get(exportUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "leads.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting leads:", error);
      alert("Error exporting leads: " + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`${backendUrl}/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeads(leads.filter((lead) => lead._id !== id));
      alert("Lead deleted successfully!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Error deleting lead: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLeadId(lead._id);
    setNewLead({ ...lead, tags: lead.tags || [] });
    setEditing(true);
  };

  const handleSaveLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.phone || !newLead.status || !newLead.source) {
      alert("All required fields must be filled!");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newLead.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newLead.phone)) {
      alert("Please enter a valid 10-digit phone number!");
      return;
    }

    try {
      const updatedLead = {
        ...newLead,
        tags: newLead.tags.join(","),
        assignedTo: newLead.assignedTo ? newLead.assignedTo : null,
      };
      const res = await axios.put(`${backendUrl}/api/leads/${selectedLeadId}`, updatedLead, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeads(leads.map((lead) => (lead._id === selectedLeadId ? res.data : lead)));
      setEditing(false);
      alert("Lead updated successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Error updating lead: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim();
      if (newLead.tags.includes(newTag)) {
        alert("Tag already exists!");
        return;
      }
      setNewLead((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setTagInput("");
      if (!availableTags.includes(newTag)) {
        setAvailableTags((prev) => [...prev, newTag]);
      }
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setNewLead((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  const handleUpdateNotes = () => {
    if (notesInput.trim()) {
      setNewLead((prev) => ({
        ...prev,
        notes: notesInput.trim(),
      }));
      setNotesInput("");
    }
  };

  const handleDeleteNotes = () => {
    setNewLead((prev) => ({
      ...prev,
      notes: "",
    }));
    setNotesInput("");
  };

  const navtoform = () =>{
    navigate('/leads')
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel - Leads</h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Filtering UI */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Leads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              >
                <option value="">All</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
                <option value="Won">Won</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Tags</label>
              <select
                name="tags"
                value={filters.tags}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              >
                <option value="">All</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                />
              </div>
            </div>

            {userRole !== "support-agent" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Assigned To</label>
                <select
                  name="assignedTo"
                  value={filters.assignedTo}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                >
                  <option value="">All</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Search (Name/Email/Phone)</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                placeholder="Search..."
              />
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Export UI */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Leads</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {Object.keys(exportFields).map((field) => (
              <label key={field} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name={field}
                  checked={exportFields[field]}
                  onChange={handleExportFieldChange}
                  className="mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
          >
            Export to Excel
          </button>
        </div>


        {/* Leads Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">All Leads</h2>
            {userRole !== "support-agent" && (
              <Link
                to="/leadlist"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Add Form
              </Link>
            )}
          </div>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : leads.length === 0 ? (
            <p className="text-gray-600">No leads found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Phone</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Source</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tags</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Notes</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Assigned To</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Created At</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Updated At</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-t border-gray-200 hover:bg-gray-50">
                      {editing && selectedLeadId === lead._id ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name="name"
                              value={newLead.name}
                              onChange={handleChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="email"
                              name="email"
                              value={newLead.email}
                              onChange={handleChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name="phone"
                              value={newLead.phone}
                              onChange={handleChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              name="status"
                              value={newLead.status}
                              onChange={handleChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Lost">Lost</option>
                              <option value="Won">Won</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name="source"
                              value={newLead.source}
                              onChange={handleChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="space-y-2">
                              {newLead.tags.map((tag, index) => (
                                <div key={index} className="flex items-center">
                                  <span className="text-gray-800">{tag}</span>
                                  <button
                                    onClick={() => handleDeleteTag(tag)}
                                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                placeholder="Add tag"
                              />
                              <button
                                onClick={handleAddTag}
                                className="w-full px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                              >
                                Add Tag
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="space-y-2">
                              <textarea
                                value={notesInput || newLead.notes}
                                onChange={(e) => setNotesInput(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                placeholder="Update notes"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleUpdateNotes}
                                  className="flex-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={handleDeleteNotes}
                                  className="flex-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {userRole !== "support-agent" ? (
                              <select
                                name="assignedTo"
                                value={newLead.assignedTo || ""}
                                onChange={handleChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                              >
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                  <option key={user._id} value={user._id}>
                                    {user.name} ({user.email})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-gray-800">{newLead.assignedTo?.name || newLead.assignedTo || "Unassigned"}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-gray-800">{new Date(lead.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-2 text-gray-800">{new Date(lead.updatedAt).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={handleSaveLead}
                              className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              Save
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-gray-800">{lead.name}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.email}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.phone}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.status}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.source}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.tags.join(", ")}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.notes}</td>
                          <td className="px-4 py-2 text-gray-800">{lead.assignedTo?.name || lead.assignedTo || "Unassigned"}</td>
                          <td className="px-4 py-2 text-gray-800">{new Date(lead.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-2 text-gray-800">{new Date(lead.updatedAt).toLocaleString()}</td>
                          <td className="px-4 py-2 flex space-x-2">
                            {userRole !== "support-agent" && (
                              <>
                                <button
                                  onClick={() => handleEditLead(lead)}
                                  className="px-4 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead._id)}
                                  className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAdminPanel;