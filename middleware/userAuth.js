import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    const user = await userModel.findById(decoded.id).select("-password ");//Hindari kirim password, Memastikan isSiCreator ada

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }
    console.log("User is:", { id: user._id, isSiCreator: user.isSiCreator });


    req.user = {
      id: user._id,
      isSiCreator: Boolean(user.isSiCreator),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default userAuth;
