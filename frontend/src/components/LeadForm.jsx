import React, { useState, useEffect } from "react";
import axios from "axios";
import backendUrl from "../context";
import { Link, useNavigate } from "react-router-dom";

const LeadForm = ({ lead, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("New");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const navigate = useNavigate()

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone);
      setSource(lead.source);
      setStatus(lead.status);
      setTags(lead.tags.join(", "));
      setNotes(lead.notes);
      setAssignedTo(lead.assignedTo);
    }
  }, [lead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const leadData = {
      name,
      email,
      phone,
      source,
      status,
      tags: tags.split(", "),
      notes,
      assignedTo,
    };

    if (lead) {
      axios
        .put(backendUrl + `/api/leads/${lead._id}`, leadData)
        .then((response) => onSave(response.data))
        .catch((error) => console.log(error));
        
    } else {
      axios
        .post(backendUrl + "/api/leads", leadData)
        .then((response) => onSave(response.data))
        .catch((error) => console.log(error));
    }

    
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create/Edit Lead</h2>
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700">Lead Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lead Name"
          required
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="phone" className="block text-gray-700">Phone</label>
        <input
          type="text"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          required
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="source" className="block text-gray-700">Source</label>
        <input
          type="text"
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source"
          required
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
          <option value="Won">Won</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className="block text-gray-700">Tags</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags"
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="notes" className="block text-gray-700">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="assignedTo" className="block text-gray-700">Assigned To</label>
        <input
          type="text"
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assigned to"
          className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Lead
        </button>
      </div>
      <div className="text-center text-blue-500">
        <Link to='/admin-panel'>Go To Admin Panel</Link>
      </div>
    </form>
  );
};

export default LeadForm;
