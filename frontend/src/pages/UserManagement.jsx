import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import backendUrl from "../context";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "sub-admin" });
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && jwtDecode(token).role === "super-admin") {
      fetchUsers();
      fetchLogs();
    } else {
      navigate("/dashboard"); 
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/users/sub-admins", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/users/activity-logs", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(backendUrl + "/api/users/users", newUser, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers([...users, res.data]);
      setNewUser({ name: "", email: "", password: "", role: "sub-admin" });
      fetchLogs();
    } catch (error) {
      alert("Error creating user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(backendUrl + `/api/users/${editingUser._id}`, editingUser, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.map((u) => (u._id === res.data._id ? res.data : u)));
      setEditingUser(null);
      fetchLogs(); 
    } catch (error) {
      alert("Error updating user");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(backendUrl + `/api/users/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.filter((u) => u._id !== id));
      fetchLogs(); 
    } catch (error) {
      alert("Error deleting user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management (Super Admin)</h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Create User Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create User</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              name="name"
              value={newUser.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
            <input
              name="email"
              value={newUser.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
            <input
              name="password"
              value={newUser.password}
              onChange={handleChange}
              placeholder="Password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
            <select
              name="role"
              value={newUser.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            >
              <option value="sub-admin">Sub-Admin</option>
              <option value="support-agent">Support Agent</option>
            </select>
            <button
              onClick={handleCreate}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Create
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Role</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                    {editingUser && editingUser._id === user._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            name="name"
                            value={editingUser.name}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            name="email"
                            value={editingUser.email}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            name="role"
                            value={editingUser.role}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          >
                            <option value="sub-admin">Sub-Admin</option>
                            <option value="support-agent">Support Agent</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={handleUpdate}
                            className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-gray-800">{user.name}</td>
                        <td className="px-4 py-2 text-gray-800">{user.email}</td>
                        <td className="px-4 py-2 text-gray-800">{user.role}</td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-4 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Logs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">User Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Action</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{log.user?.email || "Unknown"}</td>
                    <td className="px-4 py-2 text-gray-800">{log.action}</td>
                    <td className="px-4 py-2 text-gray-800">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/dashboard"
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;