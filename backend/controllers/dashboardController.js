
import Lead from "../models/Lead.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { role, id } = req.user;

    let leadQuery = {};
    if (role === "support-agent") {
      leadQuery.assignedTo = id;
    }

    const totalLeads = await Lead.countDocuments(leadQuery);
    const newLeads = await Lead.countDocuments({ ...leadQuery, status: "New" });
    const contactedLeads = await Lead.countDocuments({ ...leadQuery, status: "Contacted" });
    const qualifiedLeads = await Lead.countDocuments({ ...leadQuery, status: "Qualified" });
    const wonLeads = await Lead.countDocuments({ ...leadQuery, status: "Won" });
    const lostLeads = await Lead.countDocuments({ ...leadQuery, status: "Lost" });

    let totalUsers = 0;
    if (role === "super-admin") {
      totalUsers = await User.countDocuments();
    }

    res.status(200).json({
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};