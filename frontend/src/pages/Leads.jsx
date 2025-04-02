// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import backendUrl from "../context";

// const Leads = () => {
//     const [leads, setLeads] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");

//     useEffect(() => {
//         const fetchLeads = async () => {
//             try {
//                 const response = await axios.get(backendUrl + "/api/leads");
//                 if (Array.isArray(response.data)) {
//                     setLeads(response.data);
//                 } else {
//                     console.error("Leads response is not an array:", response.data);
//                 }
//             } catch (error) {
//                 console.error(error);
//             }
//         };

//         fetchLeads();
//     }, []);

//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     const filteredLeads = leads.filter((lead) =>
//         lead.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-lg">
//             <h2 className="text-2xl font-bold mb-4">Leads</h2>
//             <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 placeholder="Search by name"
//                 className="w-full p-3 border rounded-md mb-6"
//             />
//             <div className="space-y-4">
//                 {filteredLeads.length === 0 ? (
//                     <p>No leads found.</p>
//                 ) : (
//                     filteredLeads.map((lead) => (
//                         <div
//                             key={lead._id}
//                             className="p-4 border rounded-md shadow-sm bg-gray-50"
//                         >
//                             <h3 className="text-lg font-semibold">{lead.name}</h3>
//                             <p>Email: {lead.email}</p>
//                             <p>Phone: {lead.phone}</p>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Leads;
