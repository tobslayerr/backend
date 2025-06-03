import Report from "../models/ReportModel.js";

// User Report to Creator
export const reportCreator = async (req, res, next) => {
  try {
    const reporterId = req.user.id;
    const { creatorId } = req.params;
    const { description } = req.body;

    const report = new Report({
      reporter: reporterId,
      reported: creatorId,
      description
    });
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report Successfully Sent',
      report
    });
  } catch (error) {
    next(error);
  }
};

// Creator Report to Uer
export const reportUser = async (req, res, next) => {
  try {
    const reporterId = req.user.id;
    const { userId } = req.params;
    const { description } = req.body;

    const report = new Report({
      reporter: reporterId,
      reported: userId,
      description
    });
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report Successfully Sent',
      report
    });
  } catch (error) {
    next(error);
  }
};


// Get all Report
export const getAllReports = async(req, res, next) => {
    try {
        const reports = await Report.find().populate('reporter', 'name').populate('reported', 'name');
        res.json({
            success: true,
            reports
        });
    } catch (error) {
        next(error);
    }
};

// Get Report by Id
export const getReportById = async(req, res, next) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id).populate('reporter', 'name').populate('reported', 'name');
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report tidak ditemukan'
            });
        }
        res.json({
            success: true,
            report
        });
    } catch (error) {
        next(error);
    }
};

// Update Report
export const updateReport = async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const report = await Report.findByIdAndUpdate(id, updateData, { new: true });
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report tidak ditemukan'
            });
        }
        res.json({
            success: true,
            report
        });
    } catch (error) {
        next(error);
    }
};

// Delete Report 
export const deleteReport = async(req, res, next) => {
    try {
        const { id } = req.params;
        const report = await Report.findByIdAndDelete(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report tidak ditemukan'
            });
        }
        res.json({
            success: true,
            message: 'Report berhasil dihapus'
        });
    } catch (error) {
        next(error);
    }
};