import React, { useState } from "react";
import axios from "axios";
import backendUrl from "../context";

const ImportLeads = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post(backendUrl + "/api/leads/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Leads imported successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to import leads");
        }
    };

    return (
        <div className="max-w-sm mx-auto p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Import Leads</h3>
            <input
                type="file"
                onChange={handleFileChange}
                className="border p-2 rounded-md mb-4 w-full"
            />
            <button
                onClick={handleUpload}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
                Upload
            </button>
        </div>
    );
};

export default ImportLeads;
