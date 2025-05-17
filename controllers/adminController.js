import userModel from "../models/userModel.js";
import mongoose from "mongoose";

export const getSiCreatorRequests = async (req, res) => {
  try {
    const requests = await userModel.find(
      { siCreatorRequest: true, isSiCreator: false },
      "name email _id"
    );
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const acceptSiCreatorRequest = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user || !user.siCreatorRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    user.isSiCreator = true;
    user.siCreatorRequest = false;
    await user.save();

    res.json({ success: true, message: "User approved as SiCreator" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
