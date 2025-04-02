import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { verifySuperAdmin } from "./middleware/authMiddleware.js";
dotenv.config();

const app = express();

connectDB();


app.use(
    cors({
      origin: "http://localhost:5173", 
      methods: "GET, POST, PUT, DELETE",
      credentials: true,
    })
  );
  

app.options("*", cors());


app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", verifySuperAdmin, userRoutes);
app.use("/api/leads", verifySuperAdmin, leadRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
