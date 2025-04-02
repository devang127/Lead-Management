
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");
  console.log("Auth token:", token);
  if (!token) return res.status(401).json({ message: "Access Denied" });

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified user:", verified);
    req.user = verified;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(400).json({ message: "Invalid Token" });
  }
};

const verifyRole = (roles) => (req, res, next) => {
  console.log("Checking role:", req.user?.role, "against", roles);
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

const verifySuperAdmin = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(403).json({ message: "Forbidden" });

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    if (decoded.role !== "super-admin") {
      return res.status(403).json({ message: "You do not have permission" });
    }
    req.user = decoded;
    next();
  });
};

export { authMiddleware, verifyRole, verifySuperAdmin };