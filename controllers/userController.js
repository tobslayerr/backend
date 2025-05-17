import mongoose from "mongoose";
import userModel from "../models/userModel.js";


export const getUserData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        isSiCreator: user.isSiCreator,
        siCreatorRequest: user.siCreatorRequest,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestSiCreator = async (req, res) => {
    try {
        const userId = req.user.id; // Pastikan middleware auth sudah dipasang
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isSiCreator) {
            return res.status(400).json({ message: "You are already a SiCreator" });
        }

        if (user.siCreatorRequest) {
            return res.status(400).json({ message: "Request already submitted" });
        }

        user.siCreatorRequest = true;
        await user.save();

        res.status(200).json({ message: "Request to become SiCreator submitted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const approveSiCreator = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.siCreatorRequest) {
            return res.status(400).json({ message: "User has not requested to become SiCreator" });
        }

        user.isSiCreator = true;
        user.siCreatorRequest = false;
        await user.save();

        res.status(200).json({ message: "User approved as SiCreator" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const rejectSiCreator = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.siCreatorRequest) {
            return res.status(400).json({ message: "User has not requested to become SiCreator" });
        }

        user.siCreatorRequest = false;
        await user.save();

        res.status(200).json({ message: "SiCreator request rejected" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};