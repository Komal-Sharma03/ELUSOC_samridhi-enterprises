import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const admin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedData.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status === "Suspended") {
      return res.status(403).json({ success: false, message: "Your account is suspended" });
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return res.status(401).json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default admin;
