
import Lead from "../models/Lead.js";
import xlsx from "xlsx";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only Excel files (.xlsx, .xls) are allowed!"));
  },
}).single("file");


export const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, tags, notes, assignedTo } = req.body;


    if (!name || !email || !phone || !source) {
      return res.status(400).json({ message: "Name, email, phone, and source are required" });
    }

    const newLead = new Lead({
      name,
      email,
      phone,
      source,
      status: status || "New",
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      notes: notes || "",
      assignedTo: assignedTo || null,
    });

    await newLead.save();
    const populatedLead = await Lead.findById(newLead._id).populate("assignedTo", "name email");
    res.status(201).json(populatedLead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Error creating lead", error: error.message });
  }
};


export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    const { name, email, phone, source, status, tags, notes, assignedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lead ID" });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });


    if (role === "support-agent" && lead.assignedTo?.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your assigned leads" });
    }


    if (!name || !email || !phone || !source) {
      return res.status(400).json({ message: "Name, email, phone, and source are required" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }


    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }


    const validStatuses = ["New", "Contacted", "Qualified", "Lost", "Won"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }


    if (tags && typeof tags !== "string") {
      return res.status(400).json({ message: "Tags must be a comma-separated string" });
    }


    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid assignedTo ID" });
    }

    lead.name = name || lead.name;
    lead.email = email || lead.email;
    lead.phone = phone || lead.phone;
    lead.source = source || lead.source;
    lead.status = status || lead.status;
    lead.tags = tags ? tags.split(",").map((tag) => tag.trim()) : lead.tags;
    lead.notes = notes || lead.notes;
    lead.assignedTo = assignedTo || lead.assignedTo;

    await lead.save();
    const populatedLead = await Lead.findById(id).populate("assignedTo", "name email");
    res.status(200).json(populatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Error updating lead", error: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Error deleting lead", error: error.message });
  }
};



export const getLeads = async (req, res) => {
  try {
    const { role, id } = req.user;
    const {
      status,
      tags,
      startDate,
      endDate,
      assignedTo,
      search, 
    } = req.query;

    let query = {};


    if (role === "support-agent") {
      query.assignedTo = id;
    }


    if (status) {
      query.status = status;
    }


    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }


    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }


    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: "Invalid assignedTo ID" });
      }
      query.assignedTo = assignedTo;
    }


    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

 
    const leads = await Lead.find(query).populate("assignedTo", "name email");

    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Error fetching leads", error: error.message });
  }
};



export const getTags = async (req, res) => {
  try {
    const tags = await Lead.distinct("tags");
    res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Error fetching tags", error: error.message });
  }
};

export const exportLeads = async (req, res) => {
  try {
    const { role, id } = req.user;
    const {
      status,
      tags,
      startDate,
      endDate,
      assignedTo,
      search,
      fields, 
    } = req.query;

    let query = {};

    if (role === "support-agent") {
      query.assignedTo = id;
    }

    if (status) query.status = status;
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: "Invalid assignedTo ID" });
      }
      query.assignedTo = assignedTo;
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const leads = await Lead.find(query).populate("assignedTo", "name email");


    const availableFields = [
      "name",
      "email",
      "phone",
      "source",
      "status",
      "tags",
      "notes",
      "assignedTo",
      "createdAt",
      "updatedAt",
    ];

   
    const exportFields = fields ? fields.split(",").map((field) => field.trim()) : availableFields;
    const invalidFields = exportFields.filter((field) => !availableFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(", ")}` });
    }


    const exportData = leads.map((lead) => {
      const row = {};
      exportFields.forEach((field) => {
        if (field === "tags") {
          row[field] = lead[field].join(", ");
        } else if (field === "assignedTo") {
          row[field] = lead[field] ? lead[field].name : "Unassigned";
        } else if (field === "createdAt" || field === "updatedAt") {
          row[field] = new Date(lead[field]).toLocaleString();
        } else {
          row[field] = lead[field];
        }
      });
      return row;
    });

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Leads");

    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });


    res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(excelBuffer);
  } catch (error) {
    console.error("Error exporting leads:", error);
    res.status(500).json({ message: "Error exporting leads", error: error.message });
  }
};